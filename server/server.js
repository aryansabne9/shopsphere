import app from '../app.js';
const port = Number(process.env.PORT || 5002);
app.listen(port, () => console.log(`ShopSphere API listening on ${port}`));
