import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { platform } from "os";

const app = new Hono();

app.get("/generate", (c) => {
  return c.json({ random: Math.random() });
})

app.get("/current", (c) => {
  const ct = new Date().toISOString();
  return c.json({ currentTimes: ct });
});

app.get("/environment", (c) => {
  return c.json({ environment: process.version, platform: platform() });
});

app.get('/puppet', (c) => {
  const qP = c.req.query();
  return c.json(qP, 200)

});


const numbers: number[] = [];
app.post('/numbers', async (c) => {
  const body = await c.req.json();
  const storedNumber = body.number;
  numbers.push(storedNumber);
  return c.json({ lastStoredNumber:  storedNumber}, 201);
});

app.get('/numbers', (c) => {
  return c.json({ numbers });
});


console.log("Server is running on http://localhost:3000");

serve(app);