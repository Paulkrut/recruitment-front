import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button
} from '@mui/material';
import {
  Description, Gavel, CheckCircle, Warning, Info, 
  Security, ContactSupport, Business
} from '@mui/icons-material';
import Link from 'next/link';

export default function TermsOfServiceEN() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Description sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">Terms of Service</Typography>
          <Typography variant="h6" color="text.secondary">SofiHR Recruitment System</Typography>
          <Chip label="Updated: September 22, 2025" color="primary" sx={{ mt: 2 }} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            1. General Provisions
          </Typography>
          <Typography variant="body1" paragraph>These Terms of Service ("Terms") govern the use of the SofiHR recruitment system ("System") and define the rights and obligations of users.</Typography>
          <Typography variant="body1" paragraph>By using the System, you accept these Terms and agree to follow them.</Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            2. Definitions
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="SofiHR Platform"
                secondary="Web application for recruitment, providing services to HR clients"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="HR Client"
                secondary="Organization using the platform for recruitment"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Candidate"
                secondary="User undergoing interviews or testing on the platform"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="User"
                secondary="Individual using the platform (candidate, HR manager)"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. System Functionality
          </Typography>
          <Typography variant="body1" paragraph>The System provides the following capabilities:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Creating and Managing Vacancies"
                secondary="For HR managers"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Applying for Vacancies"
                secondary="For candidates via public links"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Conducting Interviews"
                secondary="Video and audio interviews with recording"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Candidate Testing"
                secondary="Assessment of skills and competencies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Comparing Candidates"
                secondary="AI analysis and ranking"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. Acceptable Use Policy
          </Typography>
          <Typography variant="body1" paragraph>When using the System, you agree not to:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Violate Applicable Laws"
                secondary="Including federal, state, and local laws of the United States"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Provide False or Misleading Information"
                secondary="All information must be accurate and truthful"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Discriminate or Harass"
                secondary="Violation of equal employment opportunity laws, harassment, or discriminatory practices"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Compromise System Security"
                secondary="Hacking, unauthorized access, denial of service attacks, or malware distribution"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Violate Privacy Rights"
                secondary="Unauthorized disclosure or misuse of personal information"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Use Automated Tools"
                secondary="Bots, scrapers, or automated systems without express written permission"
              />
            </ListItem>
          </List>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Anti-Discrimination Notice:</strong> This System must be used in compliance with all applicable employment laws, including Title VII of the Civil Rights Act, the Americans with Disabilities Act (ADA), and the Age Discrimination in Employment Act (ADEA). Discriminatory use of this System is strictly prohibited.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. User Obligations
          </Typography>
          <Typography variant="body1" paragraph>Users are obliged to:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Provide Accurate Information"
                secondary="Current and truthful data about yourself"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Maintain Confidentiality"
                secondary="Not disclose information about other candidates"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Use the System for Its Intended Purpose"
                secondary="Only for recruitment purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Comply with Technical Requirements"
                secondary="Stable internet connection, modern browser"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Disclaimer of Warranties and Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Disclaimer:</strong> THE SYSTEM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="No Guarantee of Availability"
                secondary="System may be unavailable due to maintenance, updates, or technical issues"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="No Guarantee of Accuracy"
                secondary="AI-generated content and analysis may contain errors or inaccuracies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="No Guarantee of Employment"
                secondary="System is a tool to assist in recruitment; hiring decisions are solely at the discretion of employers"
              />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> The System is not responsible for employment decisions made by HR managers or employers. All hiring, rejection, and other employment-related decisions are made solely by the employer and are their responsibility.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>All rights to the System belong to the developers:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Source Code"
                secondary="Protected by copyright"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Design and Interface"
                secondary="Trademarks and branding"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Algorithms and Technologies"
                secondary="Patented solutions"
              />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph>Users do not have the right to copy, modify, or distribute System elements without permission.</Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Privacy and Data Protection
          </Typography>
          <Typography variant="body1" paragraph>The System is committed to protecting your privacy and personal information in accordance with applicable U.S. data protection laws and regulations.</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Data Encryption"
                secondary="Industry-standard encryption during transmission and storage"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Access Control"
                secondary="Strict access controls and authentication measures"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Activity Logging"
                secondary="Comprehensive logging of all data operations"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Data Retention"
                secondary="Video and audio recordings retained for no more than 60 days"
              />
            </ListItem>
          </List>
          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            Video and audio interview recordings are used exclusively for interview and assessment purposes and are stored for no more than 60 calendar days from the interview completion date. For complete information, please see our{' '}
            <Link href="/privacy-policy" style={{ color: 'primary.main', textDecoration: 'none' }}>
              Privacy Policy
            </Link>.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Your Rights:</strong> You have the right to access, correct, or delete your personal information. Contact us at info@sofihr.com to exercise these rights.
            </Typography>
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. Changes to Terms of Service
          </Typography>
          <Typography variant="body1" paragraph>We reserve the right to change these Terms:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="User Notification"
                secondary="Email notification of changes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Website Update"
                secondary="Posting new version of terms"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Right to Refuse"
                secondary="Option to stop using the system"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Termination of Use
          </Typography>
          <Typography variant="body1" paragraph>Use of the System may be terminated:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="At User's Initiative"
                secondary="Withdrawal of consent for data processing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Upon Terms Violation"
                secondary="Automatic access termination"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="For Technical Reasons"
                secondary="System update or closure"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Governing Law and Dispute Resolution
          </Typography>
          <Typography variant="body1" paragraph>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</Typography>
          <Typography variant="body1" paragraph>Any dispute arising out of or relating to these Terms shall be resolved through good faith negotiations. If the parties cannot resolve the dispute within thirty (30) days, either party may pursue legal remedies in accordance with applicable law.</Typography>
          <Typography variant="body1" paragraph>You agree that any legal action or proceeding arising out of or relating to these Terms shall be brought exclusively in the federal or state courts located in Delaware, and you consent to the personal jurisdiction of such courts.</Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            12. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>For all questions related to using the System:</Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.com"
                secondary="Technical support"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.com"
                secondary="Legal questions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Feedback Form"
                secondary="Available in the system"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            13. Final Provisions
          </Typography>
          <Typography variant="body1" paragraph>These Terms come into force from the moment of posting on the website and remain in effect until their cancellation or replacement with new Terms.</Typography>
          <Typography variant="body1" paragraph>By using the System, you confirm that you have read these Terms and agree to follow them.</Typography>
        </Box>

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
            href="/privacy-policy"
          >Privacy Policy</Button>
        </Box>

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Important:</strong> These Terms of Service are governed by United States law. By using this System, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you have any questions, please contact us at info@sofihr.com.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

