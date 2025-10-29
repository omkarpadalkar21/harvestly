export const GET = async () => {
  // const payload = await getPayload({
  //   config: configPromise,
  // });

  // const data = await payload.find({
  //   collection: "categories",
  // });
  return Response.json({
    message: "This is an example of a custom route.",
  });
};
//
