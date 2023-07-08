"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { Client, Databases, ID, Account, Query } from "appwrite";
import Image from "next/image";
import greaterThan from "../../../public/greaterThan.png"

const client = new Client();
const databases = new Databases(client);
const account = new Account(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

const RightSidebar = ({
  handleLink,
  openBar,
  files,
  closeSidebar,
  passDocId,
  currentDate
}) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, );

  useEffect(() => {
    // console.log(passDocId, "console.is working broo");
    const promise = databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
      passDocId
    );

    promise.then(
      function (response) {
        // console.log(response, ".getDoc in id page"); // Success
        // console.log(id);
      },
      function (error) {
        //console.log(error); // Failure
        // console.log(id);
      }
    );
    // console.log("thank god query id value:", passDocId);
  }, );

  return (
    <div>
      {openBar && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
      <div ref={sidebarRef} className={`sidebar ${openBar ? "active" : ""}`}>
        <button onClick={closeSidebar}>
          <Image
            className="p-2 mt-4 ml-4 rounded-full shadow-md hover:opacity-80 gradients hover:transition-opacity"
            height={35}
            src={greaterThan}
            alt=""
          />
        </button>

        <div className="">
          {files &&
            files
              .filter((file) => file.$id === passDocId)
              .map((file, index) => {
                return (
                  <>
                    <div className="float-right ml-auto mr-16 text-base text-white opacity-80">
                      {new Date(file.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>

                    <div className="text-white p-14" key={file.$id}>
                      <h1 className="text-3xl font-normal ">{file.title}</h1>
                      <p className="mt-10 text-lg font-light text-left">
                        {file.description}
                      </p>
                    </div>
                  </>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
