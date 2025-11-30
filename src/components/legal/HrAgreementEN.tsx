import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button
} from '@mui/material';
import {
  Gavel, CheckCircle, Warning, Info,
  Security, Business, People, DataUsage, DeleteForever, ContactSupport
} from '@mui/icons-material';
import Link from 'next/link';

export default function HrAgreementEN() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">Service Agreement for HR Clients</Typography>
          <Typography variant="h6" color="text.secondary">Terms of Service for SofiHR Platform</Typography>
          <Chip label="Effective Date: December 1, 2025" color="primary" sx={{ mt: 2 }} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            1. General Provisions
          </Typography>
          <Typography variant="body1" paragraph>This Service Agreement ("Agreement") governs the use of the SofiHR platform by HR professionals and organizations (collectively, "Client") for recruitment and talent management services.</Typography>
          <Typography variant="body1" paragraph>By registering for, accessing, or using the SofiHR platform, Client agrees to be bound by the terms and conditions of this Agreement. This Agreement constitutes a legally binding contract between Client and SofiHR LLC, a Delaware limited liability company ("SofiHR" or "we").</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Acceptance:</strong> If you are entering into this Agreement on behalf of an organization, you represent and warrant that you have the authority to bind that organization to this Agreement.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            2. Definitions
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText primary="SofiHR Platform" secondary="Web application for recruitment, providing HR services" />
            </ListItem>
            <ListItem>
              <ListItemIcon><People color="primary" /></ListItemIcon>
              <ListItemText primary="HR Client" secondary="Individual or legal entity using the platform for recruitment" />
            </ListItem>
            <ListItem>
              <ListItemIcon><People color="primary" /></ListItemIcon>
              <ListItemText primary="Candidate" secondary="Individual undergoing interviews on the platform" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText primary="Personal Data" secondary="Information about candidates processed on the platform" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText primary="Organization" secondary="Legal entity to which an HR client may be affiliated" />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <People sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. Types of HR Clients and Their Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>The SofiHR platform supports working with different types of HR clients:</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Individual (HR Professional):</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Personal Responsibility" secondary="Full responsibility for compliance with data protection laws" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Individual Processing" secondary="Processing personal data on one's own behalf" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Option to Link to Organization" secondary="Can add organization information later" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Legal Entity (Organization):</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Responsibility" secondary="Organization's responsibility for compliance with data protection laws" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Processing" secondary="Processing personal data on behalf of the organization" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Appointment of Responsible Person" secondary="Mandatory appointment of a person responsible for personal data" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Mixed Type (HR Professional + Organization):</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Dual Responsibility" secondary="Personal + corporate responsibility" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Flexible Settings" secondary="Can work both on own behalf and on behalf of organization" />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. HR Client Obligations
          </Typography>
          <Typography variant="body1" paragraph>Regardless of client type, the HR client agrees to:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Comply with Personal Data Legislation" secondary="Data protection laws and regulations" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Use Candidate Data Only for Intended Purpose" secondary="Exclusively for hiring decisions" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Not Transfer Data to Third Parties" secondary="Without candidate consent or legal requirement" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Ensure Data Security" secondary="Technical and organizational protection measures" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Comply with Data Retention Periods" secondary="Not longer than necessary for processing purposes" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Implement Candidate Rights" secondary="Process requests for withdrawal, correction, etc." />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> When linked to an organization, the HR professional also agrees to comply with the organization's internal policies on personal data protection.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. Processing of Personal Data
          </Typography>
          <Typography variant="body1" paragraph>The HR client is the data controller for candidates' personal data and bears responsibility for their processing in accordance with applicable laws.</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Data Processing Purposes:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Candidate Assessment" secondary="Analysis of interview and testing results" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Hiring Decision Making" secondary="Selection of the most suitable candidate" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Personnel Record Keeping" secondary="When hiring a candidate" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Media Files and Data Processors:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Media Retention Period"
                secondary="Video and audio interview recordings on the platform are stored for no more than 60 calendar days from the interview completion date, after which they are subject to deletion."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Prohibition on Distribution"
                secondary="The HR client is prohibited from distributing media and interview results outside recruitment purposes; transfer to third parties - only by law or with candidate consent."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText
                primary="Data Processors (Russia)"
                secondary="External processors in the Russian Federation are engaged for audio transcription. Processing is conducted according to instructions, without data training, with limited retention periods and without cross-border transfer."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Data Retention Periods:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Upon Refusal to Hire" secondary="1 year after the decision" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Upon Hiring" secondary="According to labor legislation" />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Candidate Rights
          </Typography>
          <Typography variant="body1" paragraph>The HR client must ensure the implementation of candidate rights:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Right to Information" secondary="Know about purposes and methods of data processing" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Right to Access" secondary="Obtain a copy of processed data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Right to Rectification" secondary="Correct inaccurate data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Right to Deletion" secondary="Request deletion of data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Right to Withdraw Consent" secondary="Request to delete data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteForever color="primary" /></ListItemIcon>
              <ListItemText primary="Right to be Forgotten" secondary="Complete deletion of personal data" />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Linking HR Professional to Organization
          </Typography>
          <Typography variant="body1" paragraph>An HR professional can link their account to an organization to expand functionality and corporate work.</Typography>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Benefits of Linking to Organization:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Vacancies" secondary="Creating vacancies on behalf of the organization" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Branding" secondary="Using organization's logo and style" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Reporting" secondary="Recruitment analytics" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Corporate Settings" secondary="Common settings for all organization's HR professionals" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>Obligations When Linked to Organization:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText primary="Compliance with Corporate Policies" secondary="Following internal organization rules" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText primary="Corporate Responsibility" secondary="Responsibility for actions on behalf of the organization" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText primary="Coordination of Actions" secondary="Coordinating important decisions with management" />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Attention:</strong> When linking to an organization, the HR professional assumes additional responsibility for compliance with corporate personal data protection requirements.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Responsibilities of the Parties
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>SofiHR Platform Responsibilities:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Platform Provision" secondary="Provide access to the platform with reasonable uptime and technical support" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Data Security on Platform" secondary="Implement reasonable security measures to protect data during transmission and storage" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Service Updates" secondary="Maintain and improve platform functionality" />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <strong>HR Client Responsibilities:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Compliance with Employment Laws" 
                secondary="Full responsibility for compliance with Title VII of the Civil Rights Act, Americans with Disabilities Act (ADA), Age Discrimination in Employment Act (ADEA), and all other applicable federal, state, and local employment laws" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Data Protection Compliance" 
                secondary="Comply with CCPA, VCDPA, and other applicable state and federal data privacy regulations when processing candidate personal data" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText primary="Data Security" secondary="Protect and secure all data obtained from the platform" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Candidate Rights Implementation" 
                secondary="Respond to and fulfill candidate requests for data access, correction, deletion, and other privacy rights" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Non-Discriminatory Use" 
                secondary="Use the platform in a manner that does not discriminate based on race, color, religion, sex, national origin, age, disability, genetic information, or any other protected characteristic" 
              />
            </ListItem>
          </List>

          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important Notice:</strong> Client is solely responsible for ensuring that their use of the SofiHR platform and all hiring decisions comply with applicable employment and anti-discrimination laws. SofiHR is a technology platform provider and does not make hiring decisions. Client acknowledges that they are the final decision-maker in all employment matters.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. Changes to the Agreement
          </Typography>
          <Typography variant="body1" paragraph>SofiHR reserves the right to modify or update the terms of this Agreement at any time:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Legal Compliance" secondary="To comply with changes in applicable laws and regulations" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Platform Development" secondary="To reflect new features, capabilities, or service offerings" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Business Changes" secondary="To adjust terms based on business model evolution" />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Notification:</strong> Client will be notified of material changes to this Agreement via email or platform notification at least 30 days before the changes take effect. Continued use of the platform after such changes constitutes acceptance of the modified Agreement. If Client does not agree to the modified terms, Client should discontinue use of the platform.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>For all questions related to this Agreement:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText primary="Email: info@sofihr.com" secondary="Legal questions and contract inquiries" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText primary="Email: info@sofihr.com" secondary="Technical support and platform assistance" />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Governing Law and Dispute Resolution
          </Typography>
          <Typography variant="body1" paragraph>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</Typography>
          <Typography variant="body1" paragraph>Any disputes arising out of or relating to this Agreement shall be resolved through good faith negotiations. If negotiations fail, disputes shall be submitted to the exclusive jurisdiction of the state and federal courts located in Delaware, and Client consents to personal jurisdiction in such courts.</Typography>
          <Typography variant="body1" paragraph>By using the SofiHR platform, Client acknowledges that they have read, understood, and agree to be bound by the terms of this Agreement.</Typography>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Waiver of Class Actions:</strong> To the extent permitted by applicable law, Client agrees that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </Typography>
          </Alert>
        </Box>

        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="primary" size="large" component={Link} href="/" sx={{ mr: 2 }}>
            Back to Home
          </Button>
          <Button variant="outlined" color="primary" size="large" component={Link} href="/privacy-policy">
            Privacy Policy
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Important Legal Notice:</strong> This Agreement is a legally binding contract governed by United States law. Client is responsible for ensuring compliance with all applicable federal, state, and local laws, including but not limited to employment discrimination laws (Title VII, ADA, ADEA), data privacy regulations (CCPA, VCDPA), and other relevant legislation. If you have questions about your legal obligations, please consult with legal counsel or contact us at info@sofihr.com.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

