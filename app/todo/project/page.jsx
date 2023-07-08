"use client";
import React, { useState, useEffect, useRef } from "react";
import { createContext } from "react";
import Link from "next/link";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Client, Databases, ID, Account, Query } from "appwrite";
import { usePathname, useSearchParams } from "next/navigation";
import RightSidebar from "../components/RightSidebar";
import Image from "next/image";
// import ProtectedRoute from "@/app/hooks/useAuth";
import deleteIcon from "../../../public/deleteIcon.png"
import edit from "../../../public/edit.png"
import arrow from "../../../public/arrow.png"

const client = new Client();
const databases = new Databases(client);
const account = new Account(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

const Modal = () => {
  const [files, setFiles] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentFile, setCurrentFile] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [getDocId, setGetDocId] = useState("");
  const [passDocId, setPassDocId] = useState();
  const [openBar, setOpenBar] = useState(false);
  const [isTruncated, setIsTruncated] = useState(true);

  const pathname = `${process.env.NEXT_PUBLIC_ROUTER_ENDPOINT}/${passDocId}`;
  const maxLength = 100;
  const currentDate = new Date();

  const openModal = () => {
    setIsOpen(true);
  };

  const openSidebar = () => {
    setOpenBar(true);
    // handleLink(file)
  };

  const closeSidebar = () => {
    setOpenBar(false);
  };

  // const toggleTruncate = () => {
  //   setIsTruncated(!isTruncated)
  // }


  useEffect(() => {
    databases
      .listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID,
        process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID
      )
      .then((response) => {
        // console.log("all the listed documents", response);
        setFiles(response.documents);
      })
      .catch((error) => {
        console.log(error, "error in useEEFfect god damm it");
      });
  }, []);

  useEffect(() => {
    const promise = account.get();
    promise.then(
      function (response) {
        // console.log(response, "this is in .get");
        setUserId(response.$id);
      },
      function (error) {
        console.log(error, "error in .get");
      }
    );
  }, []);

  /* creating a project */

  const createProject = async (e) => {
    e.preventDefault();
    if (projectTitle !== "") {
      const newTask = {
        title: projectTitle.trim(),
        description: projectDesc.trim(),
        user: userId,
        date: currentDate,
      };

      try {
        const response = await databases.createDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID,
          process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
          ID.unique(),
          newTask
        );

        setFiles((prevFiles) => [
          ...prevFiles,
          {
            $id: response.$id,
            title: newTask.title,
            description: newTask.description,
            user: newTask.user,
            date: currentDate,
          },
        ]);

        setProjectTitle("");
        setProjectDesc("");
        setIsOpen(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Oops! Title cannot be empty");
    }
  };

  const handleTitleInputChange = (e) => {
    setProjectTitle(e.target.value);
  };

  const handleInputDescChange = (e) => {
    setProjectDesc(e.target.value);
  };

  /* end of creating a project */

  /* editing the project */
  const handleTitleEditChange = (e) => {
    setCurrentFile({ ...currentFile, title: e.target.value });
    // console.log(currentFile);
  };

  const handleDescEditChange = (e) => {
    setCurrentFile({ ...currentFile, description: e.target.value });
    // console.log(currentFile);
  };

  const editProject = (file) => {
    setIsEditing(true);
    setCurrentFile({ ...file });
    // console.log(file.$id);
    const promise = databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
      file.$id
    );

    promise.then(
      function (response) {
        // console.log(response, "appwrite .getDoc");
        setGetDocId(response.$id);
      },
      function (error) {
        console.log(error, "error in .getDocument");
      }
    );
  };

  function handleUpdateProject(id, updatedFile) {
    const updatedTask = {
      title: updatedFile.title,
      description: updatedFile.description,
    };

    const promise = databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
      getDocId,
      updatedTask
    );

    promise.then(
      function (response) {
        // console.log(response, "thank shiva we did it"); // Success

        const updatedFiles = files.map((file) => {
          if (file.$id === getDocId) {
            return {
              ...file,
              title: updatedTask.title,
              description: updatedTask.description,
            };
          }
          return file;
        });

        setFiles(updatedFiles);
        setIsEditing(false);
      },
      function (error) {
        console.log(error); // Failure
      }
    );
  }

  const updateProject = (e) => {
    e.preventDefault();
    handleUpdateProject(currentFile.id, currentFile);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setIsOpen(false);
  };

  /* end of editing the project */

  /* deleting the project */

  const deleteProject = async (id) => {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID,
        process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
        id
      );

      const removeProject = files.filter((file) => file.$id !== id);
      setFiles(removeProject);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  /* end of deleting the project */

  const handleLink = async (file) => {
    try {
      // console.log("Executing handleLink function...");
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID,
        process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
        file.$id
      );
      //console.log(response, "this is .getDoc in handleLink"); // Success
      setPassDocId(response.$id);

      // return true;
    } catch (error) {
      console.log(error);
      //return false; // Optionally, prevent the link from proceeding
    }
  };

  /* if changed the input and then closed the modal set the input to empty string */
  const emptyWhenClosed = () => {
    setIsOpen(false);
    setProjectTitle("");
    setProjectDesc("");
  };

  /* for dragging the project */

  const handleDragEnd = (result) => {
    if (!result || !result.destination) {
      return;
    }

    const updatedFiles = Array.from(files);
    const [movedFile] = updatedFiles.splice(result.source.index, 1);
    updatedFiles.splice(result.destination.index, 0, movedFile);

    setFiles(updatedFiles);
  };

  /* end: for dragging the project */

  return (
    <>
      {isEditing ? (
        <div>
          <div>
            <div className="darkBG" onClick={() => setIsOpen(false)} />
            <div className="centered">
              <div className="modal">
                <div className="modalHeader">
                  <h5 className="heading">Create a new Project</h5>
                  <button className="closeBtn" onClick={() => closeEditModal()}>
                    close
                  </button>
                </div>
                <div className="modalContent">
                  <div className="title-container">
                    <div className="title">Project Name</div>
                    <input
                      type="text"
                      value={currentFile.title}
                      onChange={handleTitleEditChange}
                      placeholder="build appwrite project"
                    />
                  </div>

                  <div className="desc-container">
                    <div className="description">Project Description</div>
                    <textarea
                      name=""
                      id=""
                      cols="30"
                      rows="10"
                      value={currentFile.description}
                      onChange={handleDescEditChange}
                    ></textarea>
                  </div>
                </div>
                <div className="submit">
                  <button className="btn" onClick={updateProject}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {isOpen && (
            <div>
              <div className="darkBG" onClick={() => setIsOpen(false)} />
              <div className="centered">
                <div className="modal">
                  <div className="modalHeader">
                    <h5 className="heading">Create a new Project</h5>
                    <button className="closeBtn" onClick={emptyWhenClosed}>
                      close
                    </button>
                  </div>
                  <div className="modalContent">
                    <div className="title-container">
                      <div className="title">Project Name</div>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={handleTitleInputChange}
                        placeholder="build appwrite project"
                      />
                    </div>

                    <div className="desc-container">
                      <div className="description">Project Description</div>
                      <textarea
                        name=""
                        id=""
                        cols="30"
                        rows="10"
                        value={projectDesc}
                        onChange={handleInputDescChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="submit">
                    <button className="btn" onClick={createProject}>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-row items-center justify-between w-1/2 p-6 mx-auto mb-10 text-black bg-white rounded-md mt-15 drop-shadow-md">
        <div className="flex flex-col">
          <h1 className="text-3xl font-medium">Tasks</h1>
          <p>stay in motion</p>
        </div>

        <button className="btn" onClick={openModal}>
          Create a task
        </button>
      </div>


              {files &&
                files
                  .filter((file) => file.user === userId)
                  .map((file, index) => (
               
                     
                          <div
                            key={file.$id}
                            className="flex flex-col grow w-[45%] p-6 m-6 mx-auto text-white rounded-lg drop-shadow-md bg-slate-900 cursor-pointer"
                            onMouseEnter={() => handleLink(file)}
                          >
                            <div className="flex justify-between">
                              <h2
                                className="mb-2 text-xl"
                                onClick={openSidebar}
                              >
                                {file.title}
                              </h2>

                              <Link href={pathname}>
                                <Image
                                  className="icons icons-alone"
                                  height={15}
                                  src={arrow}
                                  alt=""
                                />
                              </Link>
                            </div>

                            <p className="mt-2" onClick={openSidebar}>
                              {file.description && isTruncated
                                ? `${file.description.slice(0, maxLength)}${
                                    file.description.length > maxLength
                                      ? "... (read more) "
                                      : ""
                                  }`
                                : file.description && `${file.description.slice(0, maxLength)}...`}
                            </p>

                            <div className="flex flex-row items-center justify-between mt-4">
                              <p className="text-sm opacity-80">
                                {file.date ? new Date(file.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                ) : ""}
                              </p>

                              <div className="icons">
                                <Image
                                  src={edit}
                                  height={15}
                                  alt=""
                                  className="mr-4 icons-alone"
                                  onClick={() => editProject(file)}
                                />
                                <Image
                                  src={deleteIcon}
                                  height={15}
                                  alt=""
                                  onClick={() => deleteProject(file.$id)}
                                  className="icons-alone"
                                />
                              </div>
                            </div>
                          </div>
                     
                
                  ))}



      <RightSidebar
        openBar={openBar}
        closeSidebar={closeSidebar}
        files={files}
        passDocId={passDocId}
        handleLink={handleLink}
        currentDate={currentDate}
      />
    </>
  );
};


export default Modal;
