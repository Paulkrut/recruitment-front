import React from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


interface ProductCardProps {
  like: number;
  star: number;
  value?: number;
}

const ProductDesc = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
        sx={{ boxShadow: "none" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography variant="h5" sx={{ width: "33%", flexShrink: 0 }}>
            Description
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h5">
            Sed at diam elit. Vivamus tortor odio, pellentesque eu tincidunt a,
            aliquet sit amet lorem pellentesque eu tincidunt a, aliquet sit amet
            lorem.
          </Typography>
          <Typography color="textSecondary" mt={4}>
            Cras eget elit semper, congue sapien id, pellentesque diam. Nulla
            faucibus diam nec fermentum ullamcorper. Praesent sed ipsum ut augue
            vestibulum malesuada. Duis vitae volutpat odio. Integer sit amet
            elit ac justo sagittis dignissim.
          </Typography>
          <Typography
            color="textSecondary"
            variant="body1"
            fontWeight={400}
            mt={4}
          >
            Vivamus quis metus in nunc semper efficitur eget vitae diam. Proin
            justo diam, venenatis sit amet eros in, iaculis auctor magna.
            Pellentesque sit amet accumsan urna, sit amet pretium ipsum. Fusce
            condimentum venenatis mauris et luctus. Vestibulum ante ipsum primis
            in faucibus orci luctus et ultrices posuere cubilia curae;
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
        sx={{ boxShadow: "none" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography variant="h5" sx={{ width: "33%", flexShrink: 0 }}>
            87 Reviews
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* ------------------------------------------- */}
            {/* review 1 */}
            {/* ------------------------------------------- */}
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "grey.200",
                }}
                px={3}
                py={2}
              >
                <Rating
                    name="read-only"
                    size="small"
                    value={4}
                    readOnly
                  />
                <Typography variant="h5" mt="4px">Brooklyn Simmons</Typography>
                <Typography variant="subtitle1">
                `&quot;`We`&apos;`re loving it. This is simply unbelievable! I like it more
                  and more each day because it makes my life a lot easier.`&quot;`
                </Typography>
              </Box>
            </Grid>
            {/* ------------------------------------------- */}
            {/* review 2 */}
            {/* ------------------------------------------- */}
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "grey.200",
                }}
                px={3}
                py={2}
              >
                <Rating
                    name="read-only"
                    size="small"
                    value={4}
                    readOnly
                  />
                <Typography variant="h5" mt="4px">Ralph Edwards</Typography>
                <Typography variant="subtitle1">
                `&quot;`I`&apos;`d be lost without it. It`&apos;`s incredible. It`&apos;`s is the real deal! Since I invested in it I made over 100,000 dollars profits.`&quot;`
                </Typography>
              </Box>
            </Grid>
            {/* ------------------------------------------- */}
            {/* review 3 */}
            {/* ------------------------------------------- */}
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "grey.200",
                }}
                px={3}
                py={2}
              >
                <Rating
                    name="read-only"
                    size="small"
                    value={4}
                    readOnly
                  />
                <Typography variant="h5" mt="4px">Savannah Nguyen</Typography>
                <Typography variant="subtitle1">
                `&quot;`I STRONGLY recommend it to EVERYONE interested in running a successful online business!`&quot;`
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box></Box>
    </>
  );
};

export default ProductDesc;
