"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.createUserAction = void 0;
const svix_1 = require("svix");
const TryCatch_1 = require("../lib/TryCatch");
const user_model_1 = require("../models/user.model");
const createUserAction = async ({ clerkId, email, name }) => {
    try {
        console.log({ clerkId, email, name });
        const user = await user_model_1.User.create({ clerkId, name, email });
        return user;
    }
    catch (error) {
        console.log(error);
    }
    return null;
};
exports.createUserAction = createUserAction;
exports.createUser = (0, TryCatch_1.TryCatch)(async (req, res, next) => {
    console.log('Webhook received');
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    // Verify the webhook signature
    const payload = JSON.stringify(req.body);
    const headers = req.headers;
    const whHeaders = {
        "svix-id": headers["svix-id"],
        "svix-signature": headers["svix-signature"],
        "svix-timestamp": headers["svix-timestamp"],
    };
    const wh = new svix_1.Webhook(webhookSecret);
    let evt;
    console.log({ payload, whHeaders, webhookSecret });
    try {
        evt = wh.verify(payload, whHeaders);
        console.log('Webhook verified:', evt);
    }
    catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ error: 'Invalid signature' });
    }
    // Handle the webhook
    const eventType = evt.type;
    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        // Create user in your database
        try {
            await (0, exports.createUserAction)({
                clerkId: id,
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`.trim()
            });
            return res.status(200).json({ message: 'User created in database' });
        }
        catch (error) {
            console.error('Error creating user in database:', error);
            return res.status(500).json({ error: 'Failed to create user in database' });
        }
    }
    return res.status(200).json({ message: 'Webhook received' });
});
