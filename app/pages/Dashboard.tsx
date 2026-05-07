import { useEffect, useState } from "react";
import { getSensors } from "../services/sensorService";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getSensors().then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Sensor Data</h2>
      {data.map((d, i) => (
        <p key={i}>
          {d.temperature}°C | {d.humidity}% | {d.soil_moisture}
        </p>
      ))}
    </div>
  );
}

export default Dashboard;