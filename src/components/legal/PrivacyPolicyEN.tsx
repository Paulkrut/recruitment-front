import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button
} from '@mui/material';
import {
  Security, PrivacyTip, Gavel, Shield, ContactSupport,
  CheckCircle, Warning, Info, Videocam, AccessTime, BusinessCenter
} from '@mui/icons-material';
import Link from 'next/link';

export default function PrivacyPolicyEN() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">Privacy Policy</Typography>
          <Typography variant="h6" color="text.secondary">Processing of Personal Data in the Recruitment System</Typography>
          <Chip
            label="Updated: September 22, 2025"
            color="primary"
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* General Information */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            1. General Provisions
          </Typography>
          <Typography variant="body1" paragraph>This Privacy Policy ("Policy") describes how we collect, use, disclose, and safeguard personal information of users of the recruitment system ("System") in accordance with applicable U.S. federal and state privacy laws, including the California Consumer Privacy Act (CCPA), Virginia Consumer Data Protection Act (VCDPA), and other applicable regulations.</Typography>
          <Typography variant="body1" paragraph>By using the System, you acknowledge that you have read and understood this Policy. Your use of the System constitutes acceptance of our data practices as described herein.</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> If you are a California resident, please see Section 16 for additional information about your rights under the California Consumer Privacy Act (CCPA).
            </Typography>
          </Alert>
        </Box>

        {/* Data Controller */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
            2. Data Controller
          </Typography>
          <Typography variant="body1" paragraph>The data controller and service provider is SofiHR LLC, a Delaware limited liability company.</Typography>
          <Typography variant="body1" paragraph>
            <strong>Contact Information:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText
                primary="Email: info@sofihr.com"
                secondary="For privacy inquiries and data subject requests"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText
                primary="Mailing Address"
                secondary="Available upon request for official correspondence"
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" paragraph>
            Personal data is processed and stored in secure facilities within the United States and may be transferred to third-party processors as described in this Policy. We take appropriate measures to ensure the security and confidentiality of your data during storage and transmission.
          </Typography>
        </Box>

        {/* Purposes of Processing */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. Purposes of Personal Data Processing
          </Typography>
          <Typography variant="body1" paragraph>Your personal data is processed exclusively for the following purposes:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Recruitment for Vacant Positions"
                secondary="Assessment of candidate's compliance with vacancy requirements"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Conducting Interviews and Testing"
                secondary="Assessment of professional skills and competencies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Building Candidate Database"
                secondary="Storing information for future vacancies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Providing Feedback"
                secondary="Informing about assessment results"
              />
            </ListItem>
          </List>
        </Box>

        {/* Categories of Personal Data */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <PrivacyTip sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. Categories of Personal Data Processed
          </Typography>
          <Typography variant="body1" paragraph>The System processes the following categories of personal data:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Identification Data"
                secondary="Full name, date of birth, contact information (phone, email)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Professional Data"
                secondary="Education, work experience, skills, test results"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText
                primary="Streaming Data"
                secondary="Video and audio recordings of interviews (with your consent)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Technical Data"
                secondary="IP address, device information, cookies"
              />
            </ListItem>
          </List>
        </Box>

        {/* Legal Basis */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. Legal Basis for Processing
          </Typography>
          <Typography variant="body1" paragraph>We collect and process personal information based on the following legal grounds:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Consent"
                secondary="Where you have provided explicit consent to process your personal information for specific purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Contract Performance"
                secondary="Where processing is necessary to provide services requested by you or by our HR clients"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Legitimate Business Interests"
                secondary="Where processing is necessary for our legitimate business interests, such as fraud prevention, system security, and service improvement (balanced against your privacy rights)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Legal Compliance"
                secondary="Where processing is necessary to comply with applicable federal, state, or local laws and regulations"
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            Note: You may withdraw your consent at any time by contacting us at info@sofihr.com. Withdrawal of consent will not affect the lawfulness of processing based on consent before its withdrawal.
          </Typography>
        </Box>

        {/* Data Retention */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <AccessTime color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Personal Data Retention Periods
          </Typography>
          <Typography variant="body1" paragraph>We store your personal data only for the time necessary to achieve the processing purposes specified in this Policy.</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Specific Retention Periods:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Candidate Personal Data"
                secondary="Up to 12 months after completion of the recruitment process"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Video and Audio Interview Recordings"
                secondary="No more than 60 calendar days from the interview completion date"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Analysis and Assessment Results"
                secondary="Up to 12 months after completion of the recruitment process"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Data Processing Consents"
                secondary="Stored during the data processing period + 3 years"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>After the specified periods, all personal data is subject to automatic deletion or anonymization.</Typography>
        </Box>

        {/* Video and Audio Processing */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Videocam color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Processing of Video and Audio Data
          </Typography>
          <Typography variant="body1" paragraph>During interviews, the System may record video and audio of candidates with their explicit consent. This data is used for interview assessment purposes only and is NOT used for biometric identification, facial recognition, or voice pattern creation.</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Purposes of Video and Audio Data Processing:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Interview Content Analysis"
                secondary="Transcription and evaluation of candidate responses to interview questions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Hiring Decision Support"
                secondary="Providing HR managers with comprehensive candidate assessments"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Quality Assurance"
                secondary="Ensuring fair and consistent evaluation processes"
              />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important Notice:</strong> Video and audio recordings are used exclusively for recruitment purposes. We do not sell or share this data for marketing purposes. Recordings may be shared with third-party service providers for transcription services under strict confidentiality agreements. All recordings are automatically deleted after 60 days or upon your request, whichever comes first.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            <strong>Your Rights:</strong> You may request deletion of your video/audio recordings at any time by contacting info@sofihr.com. Please note that deletion of recordings may affect our ability to process your application.
          </Typography>
        </Box>

        {/* Data Subject Rights */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Your Privacy Rights
          </Typography>
          <Typography variant="body1" paragraph>Subject to applicable law, you have the following rights regarding your personal information:</Typography>

          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Know"
                secondary="Request information about the categories and specific pieces of personal information we have collected, used, disclosed, or sold"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Access"
                secondary="Obtain a copy of your personal information in a portable and readily usable format"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Correction"
                secondary="Request correction of inaccurate or incomplete personal information"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Deletion"
                secondary="Request deletion of your personal information, subject to certain exceptions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Opt-Out"
                secondary="Opt out of the sale or sharing of your personal information (Note: We do not sell personal information)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Non-Discrimination"
                secondary="Exercise your privacy rights without receiving discriminatory treatment"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Withdraw Consent"
                secondary="Withdraw your consent to data processing at any time (where processing is based on consent)"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>How to Exercise Your Rights:</strong> To exercise any of these rights, please contact us at info@sofihr.com. We will respond to your request within 45 days (or as otherwise required by applicable law). We may need to verify your identity before processing your request.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            <strong>Authorized Agents:</strong> You may designate an authorized agent to make requests on your behalf. To designate an authorized agent, please provide written authorization or a power of attorney.
          </Typography>
        </Box>

        {/* Platform Aggregator */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <BusinessCenter color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. SofiHR as a Platform Aggregator
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Important to understand:</strong> SofiHR is a platform aggregator providing recruitment services for HR professionals and organizations.
          </Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Types of HR Clients:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="HR Professionals (Individuals)"
                secondary="Individual platform users"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Organizations (Legal Entities)"
                secondary="Corporate platform clients"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="HR Professionals in Organizations"
                secondary="Mixed type with organization affiliation"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>How the Platform Works:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="HR Clients Post Vacancies"
                secondary="On their own behalf or on behalf of organizations"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Candidates Undergo Interviews"
                secondary="On the platform using our technologies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Results are Transferred to HR Clients"
                secondary="For making hiring decisions"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Information:</strong> After transferring data to HR clients, we do not control how they process your data. Contact HR clients to exercise your rights regarding data stored by them.
            </Typography>
          </Alert>
        </Box>

        {/* Security Measures */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Personal Data Protection Measures
          </Typography>
          <Typography variant="body1" paragraph>The following measures are applied to protect your personal data:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Data Encryption"
                secondary="Protection during transmission and storage"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Access Control"
                secondary="Restriction of access to personal data to authorized persons only"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Security Monitoring"
                secondary="Constant system security control"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Regular Updates"
                secondary="Security system updates"
              />
            </ListItem>
          </List>
        </Box>

        {/* Third Party Transfer */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Transfer of Personal Data to Third Parties
          </Typography>
          <Typography variant="body1" paragraph>Your personal data is NOT transferred to third parties, except in the following cases:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="With Your Explicit Consent"
                secondary="Only with written consent"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="As Required by Law"
                secondary="In cases provided by applicable legislation"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="For Rights and Security Protection"
                secondary="In case of security threats or rights violations"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            11.1. Service Providers and Data Processors
          </Typography>
          <Typography variant="body1" paragraph>We may engage third-party service providers to assist with audio/video transcription, data storage, payment processing, and other business functions. These service providers are contractually obligated to:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Process Data Only as Directed"
                secondary="Follow our specific instructions and not use your data for their own purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Implement Security Measures"
                secondary="Maintain appropriate technical and organizational security safeguards"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Comply with Privacy Laws"
                secondary="Adhere to applicable U.S. federal and state privacy regulations"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Data Retention Limits"
                secondary="Delete or return data when services are completed or upon our request"
              />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Third-Party Services:</strong> We may use cloud-based transcription services (e.g., AWS Transcribe, Google Cloud Speech-to-Text) and secure cloud storage providers (e.g., AWS S3, Google Cloud Storage). All service providers are carefully vetted and bound by strict data processing agreements.
            </Typography>
          </Alert>
        </Box>

        {/* Cookies */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            12. Cookies and Analytics
          </Typography>
          <Typography variant="body1" paragraph>The System uses cookies for:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="User Authorization"
                secondary="Saving session and settings"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Usage Analytics"
                secondary="Improving system performance"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Security"
                secondary="Protection against fraudulent activities"
              />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Important:</strong> You can disable cookies in your browser settings, but this may affect system functionality.
          </Alert>
        </Box>

        {/* Policy Changes */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            13. Changes to Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>We reserve the right to make changes to this Policy. When making significant changes:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="User Notification"
                secondary="Email notification about changes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Date Update"
                secondary="Indication of new effective date"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Withdraw Consent"
                secondary="Right to withdraw consent if disagreeing with changes"
              />
            </ListItem>
          </List>
        </Box>

        {/* Contact Information */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            14. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>For all questions related to this Privacy Policy or to exercise your privacy rights, please contact us:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText
                primary="Email: info@sofihr.com"
                secondary="Privacy inquiries and data subject requests"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText
                primary="Support Service"
                secondary="Available through the feedback form in the System"
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            We will respond to your inquiries within 45 days of receipt (or as otherwise required by applicable law).
          </Typography>
        </Box>

        {/* Conclusion */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            15. Governing Law and Dispute Resolution
          </Typography>
          <Typography variant="body1" paragraph>This Privacy Policy is governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</Typography>
          <Typography variant="body1" paragraph>Any disputes arising out of or relating to this Policy shall be resolved in the state or federal courts located in Delaware, and you consent to the jurisdiction of such courts.</Typography>
          <Typography variant="body1" paragraph>By using the System, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</Typography>
        </Box>

        {/* CCPA Rights for California Residents */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
            16. Additional Rights for California Residents (CCPA)
          </Typography>
          <Typography variant="body1" paragraph>If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with additional rights regarding your personal information:</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Categories of Personal Information Collected:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Identifiers"
                secondary="Name, email address, phone number, IP address"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Professional/Employment Information"
                secondary="Resume, work history, education, skills, interview responses"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Audio/Visual Information"
                secondary="Video and audio recordings of interviews"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Internet/Network Activity"
                secondary="Device information, browsing activity, interaction with our System"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Your CCPA Rights:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Know"
                secondary="Request disclosure of categories and specific pieces of personal information we collect, use, disclose, or sell"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Delete"
                secondary="Request deletion of personal information we have collected from you, subject to certain exceptions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Opt-Out of Sale"
                secondary="We do not sell your personal information to third parties"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Right to Non-Discrimination"
                secondary="We will not discriminate against you for exercising your CCPA rights"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important Notice:</strong> We do NOT sell your personal information. We do NOT share your personal information for cross-context behavioral advertising. In the preceding 12 months, we have disclosed personal information to service providers for business purposes as described in Section 11.1.
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            To exercise your CCPA rights, please contact us at info@sofihr.com. We will verify your identity before processing your request and respond within 45 days.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/"
            sx={{ mr: 2 }}
          >Back to Home</Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={Link}
            href="/contact"
            sx={{ mr: 2 }}
          >Contact Us</Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={Link}
            href="/forget-me"
            sx={{ mr: 2 }}
          >Data Deletion Request</Button>
          <Button
            variant="outlined"
            color="info"
            size="large"
            component={Link}
            href="/hr-agreement"
          >HR Client Agreement</Button>
        </Box>

        {/* Warning */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Important Notice:</strong> This Privacy Policy complies with applicable U.S. federal and state privacy laws, including CCPA, VCDPA, and other state privacy regulations. If you have questions, concerns, or wish to exercise your privacy rights, please contact us at info@sofihr.com.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

