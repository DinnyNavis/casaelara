const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendContactEmail(req, res) {
  const { name, email, phone, message } = req.body

  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    })
  }

  try {
    await resend.emails.send({
      from: 'Casa Elara Contact <onboarding@resend.dev>',
      to: 'casaelara.villa@gmail.com',
      subject: 'New Contact Message from Casa Elara Website',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e8e0d0;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h2 style="color: #2d4a35; font-size: 22px; margin: 0 0 6px;">Casa Elara</h2>
            <p style="color: #C8A84E; font-size: 13px; letter-spacing: 2px; margin: 0;">NEW CONTACT MESSAGE</p>
          </div>
          <hr style="border: none; border-top: 1px solid #C8A84E; margin-bottom: 28px;" />
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; width: 100px; vertical-align: top;">Name</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Email</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Phone</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 28px 0 16px;" />
          <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
            This message was submitted from the Casa Elara contact page.
          </p>
        </div>
      `
    })

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to send message'
    })
  }
}

module.exports = { sendContactEmail }
