import mqtt from "mqtt";

const MQTT_BROKER = "mqtt://34.134.182.142:1883";
const TOPIC_CMD = "myhome/garden/command";

// Create ONE persistent MQTT connection
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  console.log("✅ MQTT connected (API)");
});

client.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

export async function POST(req) {
  try {
    const { command } = await req.json();

    if (command !== "ON" && command !== "OFF") {
      return new Response(
        JSON.stringify({ error: "Invalid command" }),
        { status: 400 }
      );
    }

    client.publish(TOPIC_CMD, command);

    return new Response(
      JSON.stringify({ status: "sent", command }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
