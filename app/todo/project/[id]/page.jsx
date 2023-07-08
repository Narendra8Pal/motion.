"use client";
import React, { useState, useEffect, useRef } from "react";
import KanbanBoard from "../../components/kanbanBoard";
import { Client, Databases, ID, Account, Query } from "appwrite";
// import { useRouter } from "next/navigation";
const client = new Client();
const databases = new Databases(client);
const account = new Account(client);
import { useParams } from "next/navigation";

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

const NamePage = () => {
  // const router = useRouter()
  // const { id } = router.query;

  const passDocId = useParams();
  const currentDate = new Date()


  const [tasks, setTasks] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentFile, setCurrentFile] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [getDocId, setGetDocId] = useState("");

  const openModal = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const promise = account.get();
    promise.then(
      function (response) {
        // console.log(response, "this is in .get in arrow");
        setUserId(response.$id);
      },
      function (error) {
        console.log(error, "error in .get");
      }
    );
  }, []);

  useEffect(() => {
    // console.log(passDocId.id, "console.is working broo");
    const promise = databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_PROJECTS_COLLECTION_ID,
      passDocId.id
    );

    promise.then(
      function (response) {
        //console.log(response, ".getDoc in id page"); // Success
        // console.log(id);
      },
      function (error) {
        console.log(error); // Failure
        // console.log(id);
      }
    );
  }, );

  useEffect(() => {
    databases
      .listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID,
        process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID
      )
      .then((response) => {
        // console.log("all the listed documents", response);
        setTasks(response.documents);
      })
      .catch((error) => {
        console.log(error, "error in useEEFfect god damm it");
      });
  }, []);

  /* creating a project */
  const createProject = async (e) => {
    e.preventDefault();
    if (projectTitle !== "") {
      const newTask = {
        title: projectTitle.trim(),
        description: projectDesc.trim(),
        user: userId,
        projectDocId: passDocId.id,
        status: "todo",
        date: currentDate

      };

      try {
        const response = await databases.createDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID,
          process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
          ID.unique(),
          newTask
        );

        setTasks((prevTasks) => [
          ...prevTasks,
          {
            $id: response.$id,
            title: newTask.title,
            description: newTask.description,
            user: userId,
            projectDocId: passDocId.id,
            status: "todo",
            date: currentDate
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
    // setCurrentFile({...inProgress});
    // setCurrentFile({...done});

    const promise = databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
      file.$id
    );

    promise.then(function (response) {
      // console.log(response, ".getDoc in id edit");
      setGetDocId(response.$id);
    },
    function(error){
console.log(error, "error in .getDocument");
    }    
    )
  };


function handleUpdateProject(id, updatedFile){
  const updatedTask = {
    title: updatedFile.title,
    description: updatedFile.description,
  }

  const promise = databases.updateDocument(
    process.env.NEXT_PUBLIC_DATABASE_ID,
    process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
    getDocId,
    updatedTask
  );

  promise.then(
    function (response) {
      //console.log(response, "thank shiva we did it in id also"); // Success


      const updatedFiles = tasks.map((file) => {
        if (file.$id === getDocId) {
          return {
            ...file,
            title: updatedTask.title,
            description: updatedTask.description,
          };
        }
        return file;
      });

      setTasks(updatedFiles);
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
        process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
        id
      );

      const removeProject = tasks.filter((file) => file.$id !== id);
      setTasks(removeProject);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
    setIsEditing(false);
  };

  /* end of deleting the project */

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
                  <button className="btn" onClick={updateProject}>Edit</button>
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
                    <button
                      className="closeBtn"
                      onClick={() => setIsOpen(false)}
                    >
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
                    <button className="btn" onClick={createProject}>Submit</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
    <div className="flex flex-row items-center justify-between w-1/2 p-6 mx-auto mb-10 text-black bg-white rounded-md mt-15">
        <div className="flex flex-col">
          <h1 className="text-3xl font-medium">Board View</h1>
          <p>stay in motion</p>
        </div>

        <button className="btn" onClick={openModal}>Create a task</button>
      </div>

      <div className="">
        <KanbanBoard
          tasks={tasks}
          setTasks={setTasks}
          passDocId={passDocId}
          projectTitle={projectTitle}
          projectDesc={projectDesc}
          createProject={createProject}
          editProject={editProject}
          deleteProject={deleteProject}
        />
      </div>
    </>
  );
};

export default NamePage;
