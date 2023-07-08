import Link from "next/link";
import React from "react";


const HomePage = () => {
  return (
    <>
      <div className="grid items-center grid-rows-2 gap-4 my-48 h-1/2">
        <h1 className="w-2/3 mx-auto text-6xl font-semibold text-center text-white">
          track your work and
          <br />
          always be in <br />
          <span className="text-gradient">motion.</span>
        </h1>

        <div className="flex items-center justify-center">
          <Link href="/auth">
            <div className="btn-home">Sign Up</div>
          </Link>
        </div>
      </div>
<div>
      <p className="fixed bottom-0 h-16 text-white transform -translate-x-1/2 left-1/2">design & crafting 
              <Link href="https://twitter.com/Narendra8Pal" className="ml-2 text-blue-500">
               Narendra Pal
              </Link>
              </p>      
</div>
    </>
  );
};

export default HomePage;
