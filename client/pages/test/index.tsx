'use client'

import React, { useState } from 'react'
import { Button } from '../../components/Buttonf'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Input } from '../../components/inputsc'
import { Label } from "../../components/labelsc"
import { Textarea } from "../../components/textareasc"
import { Loader2 } from "lucide-react"

const EmailGenerator: React.FC = () => {
  const [emailDraft, setEmailDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    recipient: '',
    purpose: '',
    tone: '',
    context: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const fetchEmailDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch email draft')
      }

      const data = await response.json()
      setEmailDraft(data.email_draft)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setEmailDraft(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatEmail = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith("Subject:")) {
        return <h2 key={index} className="text-xl font-bold mb-4">{line}</h2>
      }
      if (line.match(/^\d\./)) {
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return (
          <p key={index} className="font-bold ml-5 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }}></p>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="mb-2"></p>
    })
  }

  return (
    <div className="min-h-screen bg-[#27282c] text-white p-8 ">
      <Card className="max-w-7xl mx-auto bg-[#27282c] border-[#404146]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchEmailDraft} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="bg-[#2d2e32] border-[#404146] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                required
                className="bg-[#2d2e32] border-[#404146] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                required
                className="bg-[#2d2e32] border-[#404146] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                required
                className="bg-[#2d2e32] border-[#404146] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                name="context"
                value={formData.context}
                onChange={handleInputChange}
                required
                className="bg-[#2d2e32] border-[#404146] text-white"
              />
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#339af0] hover:bg-[#228be6] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Email...
                </>
              ) : (
                'Generate Email'
              )}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-red-500 text-center" role="alert">
              Error: {error}
            </p>
          )}

          {emailDraft && (
            <div className="mt-8 p-6 border border-[#404146] rounded-lg bg-[#2d2e32] whitespace-pre-line">
              {formatEmail(emailDraft)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailGenerator