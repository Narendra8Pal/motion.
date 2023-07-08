"use client";
import React, { useState, useEffect } from "react";
import { Client, Account, ID } from "appwrite";
import { useRouter } from "next/navigation";

const client = new Client();
const account = new Account(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID);

const Auth = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);

  // const togglePassVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  const handleLogIn = (e) => {
    e.preventDefault();

    account
      .createEmailSession(email, password)
      .then((response) => {
        // console.log("you logged in broo:", response);

        router.push(process.env.NEXT_PUBLIC_ROUTER_ENDPOINT);
        const payload = {
          id: response.userId,
          email: response.providerUid,
        };

        const token = account.createJWT(payload);
        token
          .then(function (res) {
            // console.log(res);
          })
          .catch(function (err) {
            console.log(err, "err ocurr in token");
          });
      })

      .catch((error) => {
        console.log(error);
        alert("Oops! Please check the email and password.");
      });
    setEmail("");
    setPassword("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await account.create(ID.unique(), email, password);
      // console.log("account created bro:", response);

      setAccounts([
        ...accounts,
        {
          id: response.$id,
          email: response.email,
          password: response.password,
        },
      ]);

      alert("Welcome! Account created successfully");
      
      try {
        const sessionResponse = await account.createEmailSession(
          email,
          password
          );
          // console.log("You logged in bro from signup:", sessionResponse);
          const payload = {
            id: response.userId,
            email: response.providerUid,
          };
          
          const token = account.createJWT(payload);
          token
          .then(function (res) {
            // console.log(res);
            router.push(process.env.NEXT_PUBLIC_ROUTER_ENDPOINT);
          })
          .catch(function (err) {
            console.log(err, "err ocurr in token");
          });
        } catch (error) {
          console.log(error, "Error creating email session in signup");
        }
      } catch (error) {
        if (error.code === 400) {
          console.log(error);
          alert("Oops! Password must be at least 8 characters.");
        } else if (error.code === 409) {
          console.log(error);
          alert("Ummm! User with the same email already exists.");
        }
      }
            
    setEmail("");
    setPassword("");
  };

  const authToggle = () => {
    setOpenLogin(!openLogin);
  };

  return (
    <>
      {openLogin ? (
        <div className="flex mt-56 mb-auto text-center">
          <div className="items-center w-1/3 p-6 mx-auto bg-white shadow-md h-1/3 rounded-xl">
            <form onSubmit={handleLogIn} className="mt-6">
              <div className="grid w-1/2 grid-rows-3 gap-3 mx-auto text-white">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="bg-white border-2 text-slate-900 border-gradients-2"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="bg-white border-2 text-slate-900 border-gradients-2"
                />

                {/* <img
                  src={
                    showPassword ? "/visibilityClose.png" : "/visibility.png"
                  }
                  className="absolute cursor-pointer top-3 right-2"
                  alt=""
                  onClick={togglePassVisibility}
                /> */}

                <button className="btn">LogIn</button>
              </div>
            </form>

            <p>
            don&apos;t have an account?&nbsp;
              <button className="my-4 text-gradient" onClick={authToggle}>
                Create an account
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex mt-56 mb-auto text-center">
          <div className="items-center w-1/3 p-6 mx-auto bg-white h-1/3 rounded-xl">
            <form onSubmit={handleSignUp} className="mt-6">
              <div className="grid w-1/2 grid-rows-2 gap-3 mx-auto text-white">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="bg-white border-2 text-slate-900 border-gradients-2"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="bg-white border-2 text-slate-900 border-gradients-2"
                />

                {/* <img
                  src={
                    showPassword ? "/visibilityClose.png" : "/visibility.png"
                  }
                  className="absolute cursor-pointer top-3 right-2"
                  alt=""
                  onClick={togglePassVisibility}
                /> */}
              </div>
              <p className="m-4">password must be at least 8 characters</p>

              <button className="btn">Sign Up</button>
            </form>

            <p>
              already have a account?&nbsp;
              <button className="my-4 text-gradient" onClick={authToggle}>
                LogIn here
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;
