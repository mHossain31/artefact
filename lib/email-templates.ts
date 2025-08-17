// lib/email-templates.ts

export function generateTeamInviteEmail(
  workspaceName: string,
  inviterName: string,
  inviterEmail: string,
  role: string,
  message?: string,
  acceptUrl?: string
): string {
  // Get workspace initial
  const workspaceInitial = workspaceName.charAt(0).toUpperCase()
  
  // Get role class and formatted role
  const getRoleClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'admin'
      case 'viewer': return 'viewer'
      default: return 'editor'
    }
  }
  
  const formatRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Admin'
      case 'viewer': return 'Viewer'
      case 'editor': return 'Editor'
      default: return role
    }
  }

  // Generate accept URL (you can customize this based on your app structure)
  const inviteAcceptUrl = acceptUrl || `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept`
  
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Join ${workspaceName}!</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        
        /* Main container */
        .email-wrapper {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px),
                radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.08) 0.5px, transparent 0.5px);
            background-size: 100px 100px, 120px 120px, 80px 80px;
            opacity: 0.4;
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(10px, -10px) rotate(1deg); }
            66% { transform: translate(-5px, 5px) rotate(-1deg); }
        }
        
        .logo-container {
            position: relative;
            z-index: 2;
            margin-bottom: 24px;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .logo::before {
            content: '${workspaceInitial}';
            font-size: 32px;
            font-weight: 800;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
            position: relative;
            z-index: 2;
            color: white;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.025em;
        }
        
        .header .subtitle {
            font-size: 18px;
            font-weight: 400;
            opacity: 0.9;
            margin-bottom: 0;
        }
        
        /* Main content */
        .content {
            padding: 48px 40px;
        }
        
        .greeting {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .main-message {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 40px;
            line-height: 1.7;
            text-align: center;
        }
        
        .main-message strong {
            color: #374151;
            font-weight: 600;
        }
        
        /* Workspace card */
        .workspace-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 20px;
            padding: 32px;
            margin: 40px 0;
            border: 2px solid #e2e8f0;
            position: relative;
            overflow: hidden;
            text-align: center;
        }
        
        .workspace-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }
        
        .workspace-info {
            position: relative;
            z-index: 2;
        }
        
        .workspace-avatar {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 24px;
            margin-bottom: 16px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .workspace-name {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 12px;
            letter-spacing: -0.025em;
        }
        
        .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 2px solid;
        }
        
        .role-badge.editor {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border-color: #f59e0b;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
        }
        
        .role-badge.admin {
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            color: #5b21b6;
            border-color: #8b5cf6;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }
        
        .role-badge.viewer {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border-color: #3b82f6;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        
        .role-icon {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }
        
        /* Personal message */
        .personal-message {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-left: 4px solid #0ea5e9;
            padding: 24px;
            border-radius: 16px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
        }
        
        .personal-message::before {
            content: '"';
            position: absolute;
            top: 16px;
            left: 16px;
            font-size: 48px;
            color: rgba(14, 165, 233, 0.1);
            font-family: Georgia, serif;
            font-weight: bold;
        }
        
        .personal-message-content {
            position: relative;
            z-index: 2;
            font-style: italic;
            color: #0c4a6e;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        
        .message-author {
            font-weight: 700;
            color: #0c4a6e;
            font-style: normal;
        }
        
        /* CTA Button */
        .cta-container {
            text-align: center;
            margin: 48px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 18px 36px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 18px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            letter-spacing: -0.025em;
        }
        
        .cta-button:hover {
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
            transform: translateY(-2px);
        }
        
        /* Features */
        .features {
            margin: 48px 0;
            text-align: center;
        }
        
        .features h3 {
            font-size: 22px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 32px;
            letter-spacing: -0.025em;
        }
        
        .features-grid {
            display: flex;
            gap: 24px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .feature-item {
            flex: 1;
            min-width: 240px;
            max-width: 280px;
            background: #ffffff;
            padding: 24px;
            border-radius: 16px;
            border: 2px solid #e5e7eb;
            text-align: left;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        
        .feature-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }
        
        .feature-icon svg {
            width: 16px;
            height: 16px;
            fill: white;
        }
        
        .feature-title {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }
        
        .feature-description {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        /* Footer */
        .footer {
            background: #f8fafc;
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-content {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-top: 24px;
            flex-wrap: wrap;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .footer-links a:hover {
            background: #f0f4ff;
            color: #5a5fcf;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px !important;
            }
            
            .header {
                padding: 32px 24px !important;
            }
            
            .content {
                padding: 32px 24px !important;
            }
            
            .footer {
                padding: 32px 24px !important;
            }
            
            .features-grid {
                flex-direction: column !important;
                align-items: center !important;
            }
            
            .feature-item {
                max-width: 100% !important;
            }
            
            .footer-links {
                flex-direction: column !important;
                gap: 16px !important;
            }
            
            .workspace-card {
                padding: 24px !important;
            }
            
            .greeting {
                font-size: 24px !important;
            }
            
            .header h1 {
                font-size: 28px !important;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background: #1f2937 !important;
            }
            
            .content {
                background: #1f2937 !important;
            }
            
            .greeting {
                color: #f9fafb !important;
            }
            
            .main-message {
                color: #d1d5db !important;
            }
            
            .workspace-card {
                background: linear-gradient(135deg, #374151 0%, #4b5563 100%) !important;
                border-color: #6b7280 !important;
            }
            
            .workspace-name {
                color: #f9fafb !important;
            }
            
            .feature-item {
                background: #374151 !important;
                border-color: #6b7280 !important;
            }
            
            .feature-title {
                color: #f9fafb !important;
            }
            
            .footer {
                background: #111827 !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo-container">
                    <div class="logo"></div>
                </div>
                <div class="header-content">
                    <h1>You're Invited! 🎉</h1>
                    <p class="subtitle">Join ${workspaceName} and start collaborating</p>
                </div>
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="greeting">
                    Welcome aboard! 👋
                </div>
                
                <div class="main-message">
                    <strong>${inviterName}</strong> has invited you to join their workspace on <strong>ARTEFACT</strong>. You'll be able to collaborate with the team and access shared resources.
                </div>

                <!-- Workspace Card -->
                <div class="workspace-card">
                    <div class="workspace-info">
                        <div class="workspace-avatar">${workspaceInitial}</div>
                        <div class="workspace-name">${workspaceName}</div>
                        <div class="role-badge ${getRoleClass(role)}">
                            <svg class="role-icon" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z"/>
                            </svg>
                            ${formatRole(role)} Access
                        </div>
                    </div>
                </div>

                ${message ? `
                <!-- Personal Message -->
                <div class="personal-message">
                    <div class="personal-message-content">
                        ${message}
                    </div>
                    <div class="message-author">— ${inviterName}</div>
                </div>
                ` : ''}

                <!-- CTA Button -->
                <div class="cta-container">
                    <a href="${inviteAcceptUrl}" class="cta-button">
                        Accept Invitation & Join Team
                    </a>
                </div>

                <!-- Features -->
                <div class="features">
                    <h3>What you'll get access to:</h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <div class="feature-title">Shared Workspace</div>
                            <div class="feature-description">Access all team resources and collaborate in real-time with your colleagues.</div>
                        </div>
                        
                        <div class="feature-item">
                            <div class="feature-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                                </svg>
                            </div>
                            <div class="feature-title">Team Library</div>
                            <div class="feature-description">Browse, organize, and share your team's URL collection with powerful tools.</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-content">
                    This invitation was sent by <strong>${inviterName}</strong> (${inviterEmail}).<br>
                    If you have any questions, feel free to reach out to them directly.
                </div>
                
                <div class="footer-links">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Need Help?</a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy Policy</a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `

  return template
}

// Helper function to generate invite tokens (implement based on your needs)
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Updated sendTeamInviteEmail function for lib/email.ts
export async function sendTeamInviteEmail(
  email: string,
  workspaceName: string,
  inviterName: string,
  inviterEmail: string,
  role: string,
  message?: string
) {
  const htmlTemplate = generateTeamInviteEmail(
    workspaceName,
    inviterName,
    inviterEmail,
    role,
    message
  )

  // Use your existing email service (Resend, SendGrid, etc.)
  // Example with Resend:
  /*
  import { Resend } from 'resend'
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'Your App <noreply@yourapp.com>',
    to: [email],
    subject: `You're invited to join ${workspaceName}!`,
    html: htmlTemplate,
  })
  */

  // Example with Nodemailer:
  /*
  import nodemailer from 'nodemailer'
  
  const transporter = nodemailer.createTransporter({
    // Your email config
  })
  
  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: email,
    subject: `You're invited to join ${workspaceName}!`,
    html: htmlTemplate,
  })
  */

  // For now, just log the HTML (remove this in production)
  console.log('📧 Email HTML Template Generated:', htmlTemplate.substring(0, 200) + '...')
}