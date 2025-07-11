import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  IconBrandSkype,
  IconLanguage,
  IconMail,
  IconPhone,
  IconSchool,
  IconMapPin,
} from "@tabler/icons-react";

import BlankCard from "../../../shared/BlankCard";

const contacts = [
  {
    icon: <IconPhone size="18" />,
    title: "Call",
    subtext: "(123) 456-7890",
    color: "error.light",
    darkcolor: "error.main",
  },
  {
    icon: <IconMail size="18" />,
    title: "Email",
    subtext: "jonathan@spike.com",
    color: "success.light",
    darkcolor: "success.main",
  },
  {
    icon: <IconBrandSkype size="18" />,
    title: "Skype",
    subtext: "jonathan.doe",
    color: "primary.light",
    darkcolor: "primary.main",
  },
];
const others = [
  {
    icon: <IconMapPin size="18" />,
    title: "Location",
    subtext: "Newyork, USA - 100001",
    color: "warning.light",
    darkcolor: "warning.main",
  },
  {
    icon: <IconSchool size="18" />,
    title: "Education",
    subtext: "Saint Josef Institute of Science",
    color: "success.light",
    darkcolor: "success.main",
  },
  {
    icon: <IconLanguage size="18" />,
    title: "Language",
    subtext: "English",
    color: "secondary.light",
    darkcolor: "secondary.main",
  },
];

// const IntroCard = () => (
//   <BlankCard>
//     <Box p={3}>
//       <Typography fontWeight={600} variant="h4" mb={2}>
//         About me
//       </Typography>
//       <Typography
//         color="textSecondary"
//         variant="subtitle2"
//         fontWeight={500}
//         mb={2}
//       >
//         Hello, I’m Mike Nielsen. I’m a professional who designs, develops,
//         tests, and maintains software applications and systems.
//       </Typography>
//       <Divider />
//       <Typography fontWeight={600} variant="h5" my={2}>
//         Contact
//       </Typography>
//       {contacts.map((contact, i) => (
//         <>
//           <Stack direction="row" gap={2} alignItems="center" mb={3} key={i}>
//             <Box
//               display="flex"
//               alignItems="center"
//               justifyContent="center"
//               sx={{
//                 height: "40px",
//                 width: "40px",
//                 backgroundColor: contact.color,
//                 color: contact.darkcolor,
//               }}
//             >
//               {contact.icon}
//             </Box>
//             <Box>
//               <Typography variant="h6" fontSize="14px">
//                 {contact.title}
//               </Typography>
//               <Typography variant="subtitle2">{contact.subtext}</Typography>
//             </Box>
//           </Stack>
//         </>
//       ))}
//       <Divider />
//       <Typography fontWeight={600} variant="h5" my={2}>
//         Other
//       </Typography>
//       {others.map((other, i) => (
//         <>
//           <Stack direction="row" gap={2} alignItems="center" mb={3} key={i}>
//             <Box
//               display="flex"
//               alignItems="center"
//               justifyContent="center"
//               sx={{
//                 height: "40px",
//                 width: "40px",
//                 backgroundColor: other.color,
//                 color: other.darkcolor,
//               }}
//             >
//               {other.icon}
//             </Box>
//             <Box>
//               <Typography variant="h6" fontSize="14px">
//                 {other.title}
//               </Typography>
//               <Typography variant="subtitle2">{other.subtext}</Typography>
//             </Box>
//           </Stack>
//         </>
//       ))}
//     </Box>
//   </BlankCard>
// );

const IntroCard = () => {
  return(
      <BlankCard>
    <Box p={3}>
      <Typography fontWeight={600} variant="h4" mb={2}>
        About me
      </Typography>
      <Typography
        color="textSecondary"
        variant="subtitle2"
        fontWeight={500}
        mb={2}
      >
        Hello, I’m Mike Nielsen. I’m a professional who designs, develops,
        tests, and maintains software applications and systems.
      </Typography>
      <Divider />
      <Typography fontWeight={600} variant="h5" my={2}>
        Contact
      </Typography>
      {
        contacts.map((contact,i)=>{
           return(
            <Stack direction="row" gap={2} alignItems="center" mb={3} key={i}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: "40px",
                  width: "40px",
                  backgroundColor: contact.color,
                  color: contact.darkcolor,
                }}
              >
                {contact.icon}
              </Box>
              <Box>
                <Typography variant="h6" fontSize="14px">
                  {contact.title}
                </Typography>
                <Typography variant="subtitle2">{contact.subtext}</Typography>
              </Box>
            </Stack>
           )
        })
      }
      <Divider />
      <Typography fontWeight={600} variant="h5" my={2}>
        Other
      </Typography>
      {
        others.map((other,i)=>{
         return(
          <Stack direction="row" gap={2} alignItems="center" mb={3} key={i}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              height: "40px",
              width: "40px",
              backgroundColor: other.color,
              color: other.darkcolor,
            }}
          >
            {other.icon}
          </Box>
          <Box>
            <Typography variant="h6" fontSize="14px">
              {other.title}
            </Typography>
            <Typography variant="subtitle2">{other.subtext}</Typography>
          </Box>
        </Stack>
         ) 
        })
      }
    </Box>
  </BlankCard>
  )
}
export default IntroCard;
