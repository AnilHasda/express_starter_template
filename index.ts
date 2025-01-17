import app from "./server/server";
const port=process.env.PORT || 5000;
app.listen(port,()=>{
  console.log(`App is running on port:${port}`);
})
