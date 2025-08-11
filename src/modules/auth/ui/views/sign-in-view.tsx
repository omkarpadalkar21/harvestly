import React from "react";

const SignInView = () => {
  return (
    <div className={"grid grid-cols-1 lg:grid-cols-5"}>
      <div
        className={"bg-[#f4f4f4] h-screen w-full lg:col-span-3 overflow-y-auto"}
      >
        form column
      </div>
      <div className={"h-screen w-full lg:col-span-2 hidden lg:block"}>
          Background column
      </div>
    </div>
  );
};
export default SignInView;
