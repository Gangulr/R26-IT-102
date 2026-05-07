import { useState } from "react";
import axios from "axios";

function Vision() {
  const [image, setImage] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", image);

    const res = await axios.post("http://localhost:5001/vision", formData);
    alert(res.data.result);
  };

  return (
    <div>
      <h1>AI Vision</h1>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleUpload}>Process</button>
    </div>
  );
}

export default Vision;