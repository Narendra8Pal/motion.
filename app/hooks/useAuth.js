// 'use client'
// import { useRouter } from "next/navigation";
// import { useEffect } from 'react';
// import { Client, Databases, ID, Account, Query } from "appwrite";

// const client = new Client();
// const databases = new Databases(client);
// const account = new Account(client);

// client
//   .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
//   .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

// const ProtectedRoute = ({ children}) => {
//   const router = useRouter();

//   useEffect(() => {
//     const isAuthenticatedPromise = account.get();
  
//     const timer = setTimeout(() => {
//       isAuthenticatedPromise.then(
//         function (response) {
//           console.log(response, "This is the response from .get()");
//           const isAuthenticated = userId === response.$id;
//           console.log(isAuthenticated)
  
//           // Check if the user is authenticated
//           if (!isAuthenticated) {
//             router.push('/auth');
//           }
//         },
//         function (error) {
//           console.error(error);
//           router.push('/auth');
//         }
//       );
//     }, 2000); // Delay of 2000 milliseconds (2 seconds)
  
//     // Clean up the timer when the component unmounts
//     return () => clearTimeout(timer);
//   }, []);
  

//   return children;
// };

// export default ProtectedRoute;
