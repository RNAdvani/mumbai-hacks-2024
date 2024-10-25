import { Webhook, WebhookRequiredHeaders } from "svix";
import { TryCatch } from "../lib/TryCatch";
import { User } from "../models/user.model";

export const createUserAction = async ( {clerkId,email,name}:{clerkId:string, name:string, email :string} ) =>{
    try {
      console.log({clerkId,email,name});
        const user = await User.create({ clerkId, name, email });
        return user;
    } catch (error) {
        console.log(error);
    }
    return null;
}


export const createUser = TryCatch(async (req, res,next) => {
  console.log('Webhook received');
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET as string;

  // Verify the webhook signature
  const payload =  JSON.stringify(req.body); 
  const headers = req.headers;

  const whHeaders:WebhookRequiredHeaders = {
    "svix-id": headers["svix-id"] as string,
    "svix-signature": headers["svix-signature"] as string,
    "svix-timestamp": headers["svix-timestamp"] as string,
  };

  
  const wh = new Webhook(webhookSecret); 
  let evt;

  console.log({ payload, whHeaders, webhookSecret });

  try {
    evt = wh.verify(payload, whHeaders);
    console.log('Webhook verified:', evt);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the webhook
  const eventType = (evt as any).type;
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = (evt as any).data;
    // Create user in your database
    try {
      await createUserAction({
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`.trim()
      });
      return res.status(200).json({ message: 'User created in database' });
    } catch (error) {
      console.error('Error creating user in database:', error);
      return res.status(500).json({ error: 'Failed to create user in database' });
    }
  }

  return res.status(200).json({ message: 'Webhook received' });
});