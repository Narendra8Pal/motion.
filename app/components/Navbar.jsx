"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Client, Account } from "appwrite";
import Image from "next/image";
import github from '../../public/github.png' 

const client = new Client();
const account = new Account(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);


const Navbar = () => {
  const pathname = usePathname();

const handleLogout = () => {
  const promise = account.deleteSession('current');

  promise.then(function (response) {
    console.log(response); // Success
  }, function (error) {
      console.log(error); // Failure
  });
}

  return ( 

    
    <div className="nav">
      <Link href="/" className="flex items-center" onClick={handleLogout}>
        <p className="ml-4 mr-auto text-2xl font-bold text-white">motion.</p>
      </Link>
      {pathname !== '/' && pathname !== '/auth' && (
      <ul>
        <li>
          <Link
            href={process.env.NEXT_PUBLIC_ROUTER_ENDPOINT}
            className={pathname == (process.env.NEXT_PUBLIC_ROUTER_ENDPOINT) ? "text-white underline-offset-8 underline" : "text-white"}
            >
            All Tasks
          </Link>
        </li>
      </ul>
      )}

      <Link href="https://github.com/Narendra8Pal/motion.">
        <div className="flex items-center px-3 py-2 font-semibold text-white rounded-md shadow-md bg-slate-900 hover:opacity-80">
        <Image src={github} alt="" className="mr-2" />
        <p>hit a star</p>
        </div>
      </Link>
      </div>

  );
};


export default Navbar;
