// Vercel serverless entry point.
//
// An Express app is just a (req, res) handler, so exporting it as the default
// export lets Vercel's Node runtime serve the whole API as one function —
// without changing a line of the app itself. `vercel.json` routes every path
// here, and Express does its own routing from there.
import { createApp } from "../src/app";

export default createApp();
