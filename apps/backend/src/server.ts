import app from "./app";
import db from "./config/database";
db.getConnection()
  .then(() => {
    console.log("MySQL connected successfully");
  })
  .catch((error) => {
    console.log("MySQL connection failed");
    console.error(error);
  });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
