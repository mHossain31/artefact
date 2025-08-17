import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for 587 and other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add these options for better compatibility
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
})

// Test the connection when the module loads
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.log('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to take our messages');
  }
});

export async function sendVerificationEmail(email: string, code: string) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ARTEFACT</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .code-container {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 32px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 8px;
          color: #6366f1;
          margin: 8px 0;
        }
        .code-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 16px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .footer-links {
          margin-top: 16px;
        }
        .footer-links a {
          color: #6366f1;
          text-decoration: none;
          margin: 0 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">🔗</div>
            <div class="logo-text">ARTEFACT</div>
          </div>
          <h1 class="title">Verify Your Email Address</h1>
          <p class="subtitle">Welcome to ARTEFACT! Please verify your email to get started.</p>
        </div>

        <div class="message">
          <p>Hi there!</p>
          <p>Thanks for signing up for ARTEFACT. To complete your registration and start organizing your URLs, please verify your email address using the code below:</p>
        </div>

        <div class="code-container">
          <div class="code-label">Your verification code</div>
          <div class="code">${code}</div>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">This code will expire in 24 hours</p>
        </div>

        <div class="message">
          <p>Simply enter this code in the verification form to activate your account and start collaborating with your team.</p>
          <p>If you didn't create an account with ARTEFACT, you can safely ignore this email.</p>
        </div>

        <div class="footer">
          <p>© 2024 ARTEFACT. Built with ❤️ for teams who love organized workflows.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"ARTEFACT" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email - ARTEFACT",
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Verification email sent to ${email}`)
  } catch (error) {
    console.error("❌ Error sending verification email:", error)
    // Provide more detailed error information
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT')) {
        console.error('💡 Tip: Connection timeout. Try checking your SMTP settings or network connection.')
      } else if (error.message.includes('EAUTH')) {
        console.error('💡 Tip: Authentication failed. Check your email and password in .env file.')
      }
    }
    throw new Error("Failed to send verification email")
  }
}

export async function sendTeamInviteEmail(
  email: string,
  workspaceName: string,
  inviterName: string,
  role: string,
  message?: string,
) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Invitation - ARTEFACT</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .invitation-card {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 32px 0;
        }
        .workspace-name {
          font-size: 20px;
          font-weight: bold;
          color: #6366f1;
          margin: 8px 0;
        }
        .role-badge {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .personal-message {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 16px;
          margin: 24px 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin: 16px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">🔗</div>
            <div class="logo-text">ARTEFACT</div>
          </div>
          <h1 class="title">You're Invited to Join a Team!</h1>
          <p class="subtitle">${inviterName} has invited you to collaborate on ARTEFACT.</p>
        </div>

        <div class="invitation-card">
          <h2>Join Workspace</h2>
          <div class="workspace-name">${workspaceName}</div>
          <div class="role-badge">Role: ${role}</div>
        </div>

        <div class="message">
          <p>Hi there!</p>
          <p>${inviterName} has invited you to join the <strong>${workspaceName}</strong> workspace on ARTEFACT as a <strong>${role}</strong>.</p>
          
          ${
            message
              ? `<div class="personal-message">
                   <strong>Personal message from ${inviterName}:</strong><br>
                   "${message}"
                 </div>`
              : ""
          }
          
          <p>ARTEFACT helps teams organize, share, and collaborate on URLs with beautiful previews and powerful organization tools.</p>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="cta-button">
            Accept Invitation
          </a>
        </div>

        <div class="footer">
          <p>© 2024 ARTEFACT. Built with ❤️ for teams who love organized workflows.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"ARTEFACT Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `You're invited to join ${workspaceName} on ARTEFACT`,
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Team invitation sent to ${email}`)
  } catch (error) {
    console.error("❌ Error sending team invitation:", error)
    // Provide more detailed error information
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT')) {
        console.error('💡 Tip: Connection timeout. Try checking your SMTP settings or network connection.')
      } else if (error.message.includes('EAUTH')) {
        console.error('💡 Tip: Authentication failed. Check your email and password in .env file.')
      }
    }
    throw new Error("Failed to send team invitation")
  }
}









// import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.hostinger.com",
//   port: Number.parseInt(process.env.SMTP_PORT || "465"),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// })

// export async function sendVerificationEmail(email: string, code: string) {
//   const htmlTemplate = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Verify Your Email - ARTEFACT</title>
//       <style>
//         body {
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//           line-height: 1.6;
//           color: #374151;
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//           background-color: #f9fafb;
//         }
//         .container {
//           background: white;
//           border-radius: 16px;
//           padding: 40px;
//           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//         }
//         .header {
//           text-align: center;
//           margin-bottom: 32px;
//         }
//         .logo {
//           display: inline-flex;
//           align-items: center;
//           gap: 12px;
//           margin-bottom: 16px;
//         }
//         .logo-icon {
//           width: 40px;
//           height: 40px;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 20px;
//         }
//         .logo-text {
//           font-size: 28px;
//           font-weight: bold;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .title {
//           font-size: 24px;
//           font-weight: bold;
//           color: #1f2937;
//           margin-bottom: 8px;
//         }
//         .subtitle {
//           color: #6b7280;
//           font-size: 16px;
//         }
//         .code-container {
//           background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
//           border-radius: 12px;
//           padding: 24px;
//           text-align: center;
//           margin: 32px 0;
//         }
//         .code {
//           font-size: 32px;
//           font-weight: bold;
//           font-family: 'JetBrains Mono', monospace;
//           letter-spacing: 8px;
//           color: #6366f1;
//           margin: 8px 0;
//         }
//         .code-label {
//           font-size: 14px;
//           color: #6b7280;
//           margin-bottom: 8px;
//         }
//         .message {
//           font-size: 16px;
//           line-height: 1.6;
//           margin-bottom: 24px;
//         }
//         .cta-button {
//           display: inline-block;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           color: white;
//           text-decoration: none;
//           padding: 12px 24px;
//           border-radius: 8px;
//           font-weight: 600;
//           margin: 16px 0;
//         }
//         .footer {
//           margin-top: 40px;
//           padding-top: 24px;
//           border-top: 1px solid #e5e7eb;
//           text-align: center;
//           color: #6b7280;
//           font-size: 14px;
//         }
//         .footer-links {
//           margin-top: 16px;
//         }
//         .footer-links a {
//           color: #6366f1;
//           text-decoration: none;
//           margin: 0 8px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <div class="logo">
//             <div class="logo-icon">🔗</div>
//             <div class="logo-text">ARTEFACT</div>
//           </div>
//           <h1 class="title">Verify Your Email Address</h1>
//           <p class="subtitle">Welcome to ARTEFACT! Please verify your email to get started.</p>
//         </div>

//         <div class="message">
//           <p>Hi there!</p>
//           <p>Thanks for signing up for ARTEFACT. To complete your registration and start organizing your URLs, please verify your email address using the code below:</p>
//         </div>

//         <div class="code-container">
//           <div class="code-label">Your verification code</div>
//           <div class="code">${code}</div>
//           <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">This code will expire in 24 hours</p>
//         </div>

//         <div class="message">
//           <p>Simply enter this code in the verification form to activate your account and start collaborating with your team.</p>
//           <p>If you didn't create an account with ARTEFACT, you can safely ignore this email.</p>
//         </div>

//         <div class="footer">
//           <p>© 2024 ARTEFACT. Built with ❤️ for teams who love organized workflows.</p>
//           <div class="footer-links">
//             <a href="#">Privacy Policy</a>
//             <a href="#">Terms of Service</a>
//             <a href="#">Support</a>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>
//   `

//   const mailOptions = {
//     from: `"ARTEFACT" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: "Verify Your Email - ARTEFACT",
//     html: htmlTemplate,
//   }

//   try {
//     await transporter.sendMail(mailOptions)
//     console.log(`Verification email sent to ${email}`)
//   } catch (error) {
//     console.error("Error sending verification email:", error)
//     throw new Error("Failed to send verification email")
//   }
// }

// export async function sendTeamInviteEmail(
//   email: string,
//   workspaceName: string,
//   inviterName: string,
//   role: string,
//   message?: string,
// ) {
//   const htmlTemplate = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Team Invitation - ARTEFACT</title>
//       <style>
//         body {
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//           line-height: 1.6;
//           color: #374151;
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//           background-color: #f9fafb;
//         }
//         .container {
//           background: white;
//           border-radius: 16px;
//           padding: 40px;
//           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//         }
//         .header {
//           text-align: center;
//           margin-bottom: 32px;
//         }
//         .logo {
//           display: inline-flex;
//           align-items: center;
//           gap: 12px;
//           margin-bottom: 16px;
//         }
//         .logo-icon {
//           width: 40px;
//           height: 40px;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 20px;
//         }
//         .logo-text {
//           font-size: 28px;
//           font-weight: bold;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .title {
//           font-size: 24px;
//           font-weight: bold;
//           color: #1f2937;
//           margin-bottom: 8px;
//         }
//         .subtitle {
//           color: #6b7280;
//           font-size: 16px;
//         }
//         .invitation-card {
//           background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
//           border-radius: 12px;
//           padding: 24px;
//           text-align: center;
//           margin: 32px 0;
//         }
//         .workspace-name {
//           font-size: 20px;
//           font-weight: bold;
//           color: #6366f1;
//           margin: 8px 0;
//         }
//         .role-badge {
//           display: inline-block;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           color: white;
//           padding: 6px 12px;
//           border-radius: 6px;
//           font-size: 14px;
//           font-weight: 600;
//           margin: 8px 0;
//         }
//         .message {
//           font-size: 16px;
//           line-height: 1.6;
//           margin-bottom: 24px;
//         }
//         .personal-message {
//           background: #f0f9ff;
//           border-left: 4px solid #0ea5e9;
//           padding: 16px;
//           margin: 24px 0;
//           border-radius: 0 8px 8px 0;
//           font-style: italic;
//         }
//         .cta-button {
//           display: inline-block;
//           background: linear-gradient(135deg, #6366f1, #8b5cf6);
//           color: white;
//           text-decoration: none;
//           padding: 12px 24px;
//           border-radius: 8px;
//           font-weight: 600;
//           margin: 16px 0;
//         }
//         .footer {
//           margin-top: 40px;
//           padding-top: 24px;
//           border-top: 1px solid #e5e7eb;
//           text-align: center;
//           color: #6b7280;
//           font-size: 14px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <div class="logo">
//             <div class="logo-icon">🔗</div>
//             <div class="logo-text">ARTEFACT</div>
//           </div>
//           <h1 class="title">You're Invited to Join a Team!</h1>
//           <p class="subtitle">${inviterName} has invited you to collaborate on ARTEFACT.</p>
//         </div>

//         <div class="invitation-card">
//           <h2>Join Workspace</h2>
//           <div class="workspace-name">${workspaceName}</div>
//           <div class="role-badge">Role: ${role}</div>
//         </div>

//         <div class="message">
//           <p>Hi there!</p>
//           <p>${inviterName} has invited you to join the <strong>${workspaceName}</strong> workspace on ARTEFACT as a <strong>${role}</strong>.</p>
          
//           ${
//             message
//               ? `<div class="personal-message">
//                    <strong>Personal message from ${inviterName}:</strong><br>
//                    "${message}"
//                  </div>`
//               : ""
//           }
          
//           <p>ARTEFACT helps teams organize, share, and collaborate on URLs with beautiful previews and powerful organization tools.</p>
//         </div>

//         <div style="text-align: center;">
//           <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="cta-button">
//             Accept Invitation
//           </a>
//         </div>

//         <div class="footer">
//           <p>© 2024 ARTEFACT. Built with ❤️ for teams who love organized workflows.</p>
//           <p>If you didn't expect this invitation, you can safely ignore this email.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `

//   const mailOptions = {
//     from: `"ARTEFACT Team" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: `You're invited to join ${workspaceName} on ARTEFACT`,
//     html: htmlTemplate,
//   }

//   try {
//     await transporter.sendMail(mailOptions)
//     console.log(`Team invitation sent to ${email}`)
//   } catch (error) {
//     console.error("Error sending team invitation:", error)
//     throw new Error("Failed to send team invitation")
//   }
// }



