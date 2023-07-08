import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Client, Databases } from "appwrite";
import Image from "next/image";
import inprogress from "../../../public/inprogress.png";
import todo from "../../../public/todo.png";
import edit from "../../../public/edit.png";
import deleteIcon from "../../../public/deleteIcon.png";
import done from "../../../public/done.png";
import greaterThan from "../../../public/greaterThan.png";

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

const KanbanBoard = ({
  tasks,
  setTasks,
  passDocId,
  editProject,
  deleteProject,
}) => {
  const [statusDocId, setStatusDocId] = useState("");
  const [openBar, setOpenBar] = useState(false);
  const [isTruncated, setIsTruncated] = useState(true);
  const maxLength = 100;
  const currentDate = new Date();

  const openSidebar = () => {
    setOpenBar(true);
    // handleLink(file)
  };

  const closeSidebar = () => {
    setOpenBar(false);
  };

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
  }, []);

  const handleUpdatedStatus = async (draggedTask, updatedStatus) => {
    // Update the status of the dragged task in the tasks array
    const updatedTasksArry = tasks.map((task) => {
      if (task.$id === draggedTask.$id) {
        return { ...task, status: updatedStatus };
      }
      return task;
    });

    const updatedTasks = {
      status: updatedStatus,
    };
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID,
        process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
        statusDocId,
        updatedTasks
      );

      // Update the state with the modified tasks array
      setTasks(updatedTasksArry);
    } catch (error) {
      console.log(error, "Error in updateDoc in updateStatus");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result || !result.destination) {
      return;
    }

    const { source, destination } = result;

    // Check if the item was dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Check if the item was dropped into a different droppable area
    if (source.droppableId !== destination.droppableId) {
      // Get the source and destination column IDs
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;

      // Find the task that was dragged
      const draggedTaskIndex = tasks.findIndex(
        (task) => task.$id === result.draggableId
      );

      if (draggedTaskIndex === -1) {
        return;
      }

      // Remove the task from its original position
      const [draggedTask] = tasks.splice(draggedTaskIndex, 1);

      // Get the index where the task should be inserted in the destination column
      const destinationIndex = destination.index;

      // Find the index where the task should be inserted in the tasks array
      let insertIndex;
      if (destinationColumnId === "todo") {
        insertIndex = tasks.findIndex((task) => task.status !== "todo");
      } else if (destinationColumnId === "inprogress") {
        insertIndex = tasks.findIndex((task) => task.status === "done");
      } else if (destinationColumnId === "done") {
        insertIndex = tasks.length;
      }

      if (insertIndex === -1) {
        return;
      }

      // Insert the task at the desired position
      tasks.splice(insertIndex, 0, draggedTask);

      // Update the status of the dragged task based on the destination column
      draggedTask.status = destinationColumnId;

      // Call the handleUpdatedStatus function
      handleUpdatedStatus(draggedTask, destinationColumnId);
    } else {
      // Handle reordering tasks within the same column

      // Get the column ID
      const columnId = source.droppableId;

      // Find the column that contains the tasks
      const column = tasks.find((col) => col.id === columnId);

      if (!column) {
        return;
      }

      // Find the task that was dragged
      const draggedTask = column.tasks.find(
        (task) => task.$id === result.draggableId
      );

      if (!draggedTask) {
        return;
      }

      // Remove the dragged task from its original position
      const draggedTaskIndex = column.tasks.findIndex(
        (task) => task.$id === draggedTask.$id
      );

      if (draggedTaskIndex === -1) {
        return;
      }

      const [removedTask] = column.tasks.splice(draggedTaskIndex, 1);

      // Get the index where the task should be inserted in the same column
      const destinationIndex = destination.index;

      // Insert the task at the desired position in the same column
      column.tasks.splice(destinationIndex, 0, removedTask);

      // Call the handleUpdatedStatus function
      handleUpdatedStatus(removedTask, columnId);
    }
  };

  useEffect(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleDocId = async (task) => {
    // console.log("don't touch me na!")

    const promise = databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_TASKS_COLLECTION_ID,
      task.$id
    );

    promise.then(
      function (response) {
        // console.log(response); // Success
        setStatusDocId(response.$id);
      },
      function (error) {
        console.log(error, "in handleDocId function"); // Failure
      }
    );
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="list-grid">
          <div>
            <div className="flex items-center ml-5 ">
              <Image src={todo} height={20} alt="" />
              <h1 className="ml-5 text-white">To-Do</h1>
            </div>
            <div>
              <Droppable droppableId="todo">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks &&
                      tasks
                        .filter(
                          (task) =>
                            task.projectDocId === passDocId.id &&
                            task.status === "todo"
                        )
                        .map((task, index) => (
                          <Draggable
                            key={task.$id}
                            draggableId={task.$id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div
                                  key={task.$id}
                                  className="m-5 cursor-pointer"
                                  onMouseEnter={() => handleDocId(task)}
                                >
                                  <div className="p-6 text-white break-words rounded-lg bg-slate-900 drop-shadow-md">
                                    <h2
                                      className="mb-2 text-lg"
                                      onClick={openSidebar}
                                    >
                                      {task.title}
                                    </h2>
                                    <p
                                      className="mt-2 text-sm text-left"
                                      onClick={openSidebar}
                                    >
                                      {task.description && isTruncated
                                        ? `${task.description.slice(
                                            0,
                                            maxLength
                                          )}${
                                            task.description.length > maxLength
                                              ? "... (read more) "
                                              : ""
                                          }`
                                        : task.description &&  `${task.description.slice(
                                            0,
                                            maxLength
                                          )}...`}
                                    </p>

                                    <div className="flex justify-between mt-3 text-sm align-middle opacity-80">
                                      {task.date ? new Date(task.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }
                                      ) : ""}

                                      <div className="flex justify-end h-4 align-middle">
                                        <Image
                                          src={edit}
                                          height={15}
                                          alt=""
                                          className="mr-4 kanban-icons"
                                          onClick={() => editProject(task)}
                                        />
                                        <Image
                                          src={deleteIcon}
                                          height={15}
                                          alt=""
                                          onClick={() =>
                                            deleteProject(task.$id)
                                          }
                                          className="kanban-icons"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          <div>
            <div className="flex items-center ml-5 ">
              <Image src={inprogress} height={20} alt="" />
              <h1 className="ml-5 text-white">In-Progress</h1>
            </div>

            <div>
              <Droppable droppableId="inprogress">
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks &&
                      tasks
                        .filter(
                          (task) =>
                            task.projectDocId === passDocId.id &&
                            task.status === "inprogress"
                        )
                        .map((task, index) => (
                          <Draggable
                            key={task.$id}
                            draggableId={task.$id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div
                                  key={task.$id}
                                  className="m-5 cursor-pointer"
                                  onMouseEnter={() => handleDocId(task)}
                                >
                                  <div className="p-6 text-white break-words rounded-lg bg-slate-900 drop-shadow-md">
                                    <h2
                                      className="mb-2 text-lg"
                                      onClick={openSidebar}
                                    >
                                      {task.title}
                                    </h2>
                                    <p
                                      className="mt-2 text-sm text-left"
                                      onClick={openSidebar}
                                    >
                                      {task.description && isTruncated
                                        ? `${task.description.slice(
                                            0,
                                            maxLength
                                          )}${
                                            task.description.length > maxLength
                                              ? "... (read more) "
                                              : ""
                                          }`
                                        : task.description && `${task.description.slice(
                                            0,
                                            maxLength
                                          )}...`}
                                    </p>

                                    <div className="flex justify-between mt-3 text-sm align-middle opacity-80">
                                      {task.date ? new Date(task.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }
                                      ) : ""}

                                      <div className="flex justify-end h-4 align-middle">
                                        <Image
                                          src={edit}
                                          height={15}
                                          alt=""
                                          className="mr-4 kanban-icons"
                                          onClick={() => editProject(task)}
                                        />
                                        <Image
                                          src={deleteIcon}
                                          height={15}
                                          alt=""
                                          onClick={() =>
                                            deleteProject(task.$id)
                                          }
                                          className="kanban-icons"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          <div>
            <div className="flex items-center ml-5">
              <Image src={done} height={20} alt="" />
              <h1 className="ml-5 text-white">Done</h1>
            </div>

            <div>
              <Droppable droppableId="done">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks &&
                      tasks
                        .filter(
                          (task) =>
                            task.projectDocId === passDocId.id &&
                            task.status === "done"
                        )
                        .map((task, index) => (
                          <Draggable
                            key={task.$id}
                            draggableId={task.$id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div
                                  key={task.$id}
                                  className="m-5 cursor-pointer"
                                  onMouseEnter={() => handleDocId(task)}
                                >
                                  <div className="p-6 text-white break-words rounded-lg bg-slate-900 drop-shadow-md">
                                    <h2
                                      className="mb-2 text-lg"
                                      onClick={openSidebar}
                                    >
                                      {task.title}
                                    </h2>
                                    <p
                                      className="mt-2 text-sm text-left"
                                      onClick={openSidebar}
                                    >
                                      {task.description && isTruncated
                                        ? `${task.description.slice(
                                            0,
                                            maxLength
                                          )}${
                                            task.description.length > maxLength
                                              ? "... (read more) "
                                              : ""
                                          }`
                                        : task.description && `${task.description.slice(
                                            0,
                                            maxLength
                                          )}...`}
                                    </p>

                                    <div className="flex justify-between mt-3 text-sm align-middle opacity-80">
                                      {task.date ? new Date(task.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }
                                      ) : ""}

                                      <div className="flex justify-end h-4 align-middle">
                                        <Image
                                          src={edit}
                                          height={15}
                                          alt=""
                                          className="mr-4 kanban-icons"
                                          onClick={() => editProject(task)}
                                        />
                                        <Image
                                          src={deleteIcon}
                                          height={15}
                                          alt=""
                                          onClick={() =>
                                            deleteProject(task.$id)
                                          }
                                          className="kanban-icons"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>

      <div>
        {openBar && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}
        <div ref={sidebarRef} className={`sidebar ${openBar ? "active" : ""}`}>
          <button onClick={closeSidebar}>
            <Image
              className="p-2 mt-4 ml-4 rounded-full shadow-md hover:opacity-80 gradients hover:transition-opacity"
              src={greaterThan}
              height={35}
              alt=""
            />
          </button>

          <div className="">
            {tasks &&
              tasks
                .filter((task) => task.$id === statusDocId)
                .map((task, index) => {
                  return (
                    <>
                      <div className="float-right ml-auto mr-16 text-base text-white opacity-80">
                        {task.date ? new Date(task.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) : ""}
                      </div>

                      <div className="text-white p-14" key={task.$id}>
                        <h1 className="text-3xl font-normal ">{task.title}</h1>

                        <p className="mt-10 text-lg font-light text-left">
                        {task.description}
                        </p>
                      </div>
                    </>
                  );
                })}
          </div>
        </div>
      </div>
    </>
  );
};

export default KanbanBoard;
