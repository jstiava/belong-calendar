import React from 'react';
import { AppBar, Toolbar, IconButton, Link } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const Footer = () => {
  return (
    <div>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Link href="../ToS">Terms of Service</Link>
          <Link href="../privacy-notice">Privacy Notice</Link>
          <Link href="../liability-policy">Liability Policy</Link>
          <div className="flex flex-row">
            <IconButton href="https://www.instagram.com/moziteam/">
              <InstagramIcon />
            </IconButton>
            <IconButton href="https://www.linkedin.com/company/moziday/">
              <LinkedInIcon />
            </IconButton>
            <IconButton href="mailto:moziteam1@gmail.com">
              <MailOutlineIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Footer;
//note: there is a glitch where refreshing the page multiple times will make the footer styling disappear and the only way to get it back
//is by running npm run dev again, and I think that it's because of this: - don't know how to fix this
//Warning: Prop `className` did not match. Server: "MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways makeStyles-linkItem-7 css-1bhi0za-MuiTypography-root-MuiLink-root" Client: "MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways makeStyles-linkItem-3 css-1bhi0za-MuiTypography-root-MuiLink-root"

// "use client"
// import dynamic from 'next/dynamic'

// const BsInstagram = dynamic(() => import('../icons/BsInstagram'))
// const AiOutlineMail = dynamic(() => import('../icons/AiOutlineMail'))
// const AiOutlineLinkedin = dynamic(() => import('../icons/AiOutlineLinkedin'))

// const Footer = () => {
//   return (
//     <div id="footer" className="flex  footer-container w-full mt-[50px] border-[2px] border-gray-300 rounded-lg p-[10px] justify-center items-center bg-black text-white" >
//       <footer className="footer-styling z-50 flex sm:flex-row flex-col items-center" style={{zIndex:10}}>
//         <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//           <a href="../ToS">Terms of Service</a>
//         </div>
//         <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//           <a href="../privacy-notice">Privacy Notice</a>
//         </div>
//         <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//           <a href="../liability-policy">Liability Policy</a>
//         </div>
//         <div className = "flex flex-row ">
//           <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//             <a href="https://www.linkedin.com/company/moziday/"><AiOutlineLinkedin /></a>
//           </div>
//           <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//             <a href="https://www.instagram.com/moziteam/"><BsInstagram /></a>
//           </div>
//           <div className="footer-rounded-rect sm:ml-[40px] mx-[10px] border-[2px] border-gray-300 rounded-lg p-[5px] my-[4px]">
//             <a href="mailto: moziteam1@gmail.com"><AiOutlineMail /></a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Footer;
