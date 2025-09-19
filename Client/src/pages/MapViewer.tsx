import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type {
  MapImage,
  Sprinkler,
  SprinklerCreateData,
  SprinklerUpdateData,
} from "../services/api";

interface SprinklerFormData {
  label: string;
  active: boolean;
  flowRate: string;
}

function MapViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mapData, setMapData] = useState<MapImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedSprinkler, setSelectedSprinkler] = useState<Sprinkler | null>(
    null
  );
  const [showSprinklerModal, setShowSprinklerModal] = useState(false);
  const [sprinklerFormData, setSprinklerFormData] = useState<SprinklerFormData>(
    {
      label: "",
      active: true,
      flowRate: "",
    }
  );
  const [isAddingMode, setIsAddingMode] = useState(false);
  // const [draggedSprinkler, setDraggedSprinkler] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    if (id) {
      fetchMapData().catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (mapData && imageLoaded) {
      drawCanvas();
    }
  }, [mapData, imageLoaded, canvasSize]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      if (!user?.id || !id) return;

      const response = await api.get<MapImage>(`/maps/${id}?userId=${user.id}`);

      if (response.data.success && response.data.data) {
        const map = response.data.data;

        console.log(map);

        console.log("Full response:", response);
        console.log("Map data:", map);
        console.log("Image URL:", map.imageUrl);

        if (!map.imageUrl) {
          setError("No image URL found for this map");
          setLoading(false);
          return;
        }

        imageRef.current.onload = () => {
          setImageLoaded(true);
          calculateCanvasSize();
        };
        imageRef.current.src = map.imageUrl;

        setMapData(map);
      } else {
        setError(response.data.message || "Failed to fetch map data");
      }
    } catch (err) {
      console.error("Error fetching map:", err);
      setError("Failed to fetch map");
    } finally {
      setLoading(false);
    }
  };

  const calculateCanvasSize = () => {
    if (!containerRef.current || !imageRef.current.naturalWidth) return;

    const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
    const imageAspectRatio =
      imageRef.current.naturalWidth / imageRef.current.naturalHeight;

    let canvasWidth = Math.min(containerWidth, 800);
    let canvasHeight = canvasWidth / imageAspectRatio;

    // Ensure minimum height
    if (canvasHeight < 400) {
      canvasHeight = 400;
      canvasWidth = canvasHeight * imageAspectRatio;
    }

    setCanvasSize({ width: canvasWidth, height: canvasHeight });
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw sprinklers
    mapData.sprinklers.forEach((sprinkler) => {
      const x = sprinkler.xRatio * canvas.width;
      const y = sprinkler.yRatio * canvas.height;

      // Draw sprinkler circle
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = sprinkler.active ? "#10B981" : "#EF4444";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label if exists
      if (sprinkler.label) {
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(sprinkler.label, x, y - 20);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mapData) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = x / rect.width;
    const yRatio = y / rect.height;

    if (isAddingMode) {
      // Add new sprinkler
      addSprinkler(xRatio, yRatio);
    } else {
      // Check if clicking on existing sprinkler
      const clickedSprinkler = mapData.sprinklers.find((sprinkler) => {
        const sprinklerX = sprinkler.xRatio * rect.width;
        const sprinklerY = sprinkler.yRatio * rect.height;
        const distance = Math.sqrt(
          Math.pow(x - sprinklerX, 2) + Math.pow(y - sprinklerY, 2)
        );
        return distance <= 15;
      });

      if (clickedSprinkler) {
        editSprinkler(clickedSprinkler);
      }
    }
  };

  async function addSprinkler(xRatio: number, yRatio: number) {
    try {
      if (!user?.id || !id) return;

      const sprinklerData: SprinklerCreateData = {
        userId: user.id,
        xRatio,
        yRatio,
        active: true,
        label: `Sprinkler ${mapData!.sprinklers.length + 1}`,
      };

      const response = await api.post<Sprinkler>(
        `/maps/${id}/sprinklers`,
        sprinklerData
      );

      if (response.data.success) {
        await fetchMapData(); // Refresh data
        setIsAddingMode(false);
      } else {
        alert(response.data.message || "Failed to add sprinkler");
      }
    } catch (err) {
      console.error("Error adding sprinkler:", err);
      alert("Failed to add sprinkler");
    }
  }

  function editSprinkler(sprinkler: Sprinkler) {
    setSelectedSprinkler(sprinkler);
    setSprinklerFormData({
      label: sprinkler.label || "",
      active: sprinkler.active,
      flowRate: sprinkler.flowRate?.toString() || "",
    });
    setShowSprinklerModal(true);
  }

  const handleSprinklerUpdate = async () => {
    if (!selectedSprinkler || !user?.id) return;

    try {
      const updateData: SprinklerUpdateData = {
        userId: user.id,
        label: sprinklerFormData.label || undefined,
        active: sprinklerFormData.active,
        flowRate: sprinklerFormData.flowRate
          ? parseFloat(sprinklerFormData.flowRate)
          : undefined,
      };

      const response = await api.put<Sprinkler>(
        `/sprinklers/${selectedSprinkler.id}`,
        updateData
      );

      if (response.data.success) {
        await fetchMapData();
        setShowSprinklerModal(false);
        setSelectedSprinkler(null);
      } else {
        alert(response.data.message || "Failed to update sprinkler");
      }
    } catch (err) {
      console.error("Error updating sprinkler:", err);
      alert("Failed to update sprinkler");
    }
  };

  const handleSprinklerDelete = async () => {
    if (!selectedSprinkler || !user?.id) return;

    if (!confirm("Are you sure you want to delete this sprinkler?")) return;

    try {
      const response = await api.delete<void>(
        `/sprinklers/${selectedSprinkler.id}`,
        {
          data: { userId: user.id },
        }
      );

      if (response.data.success) {
        await fetchMapData();
        setShowSprinklerModal(false);
        setSelectedSprinkler(null);
      } else {
        alert(response.data.message || "Failed to delete sprinkler");
      }
    } catch (err) {
      console.error("Error deleting sprinkler:", err);
      alert("Failed to delete sprinkler");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mapData.title}
            </h1>
            {mapData.description && (
              <p className="mt-1 text-gray-600">{mapData.description}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={`px-4 py-2 rounded-md font-medium transition duration-150 ${
                isAddingMode
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isAddingMode ? "Cancel Adding" : "Add Sprinkler"}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition duration-150"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {isAddingMode && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-6">
            Click anywhere on the map to add a new sprinkler
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div ref={containerRef} className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={handleCanvasClick}
              className="border border-gray-300 rounded-lg cursor-crosshair max-w-full"
              style={{ cursor: isAddingMode ? "crosshair" : "pointer" }}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Total Sprinklers</h3>
              <p className="text-2xl font-bold text-blue-600">
                {mapData.sprinklers.length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Active Sprinklers</h3>
              <p className="text-2xl font-bold text-green-600">
                {mapData.sprinklers.filter((s) => s.active).length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Inactive Sprinklers</h3>
              <p className="text-2xl font-bold text-red-600">
                {mapData.sprinklers.filter((s) => !s.active).length}
              </p>
            </div>
          </div>
        </div>

        {/* Sprinkler Edit Modal */}
        {showSprinklerModal && selectedSprinkler && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Sprinkler
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    value={sprinklerFormData.label}
                    onChange={(e) =>
                      setSprinklerFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Flow Rate (ml/min)
                  </label>
                  <input
                    type="number"
                    value={sprinklerFormData.flowRate}
                    onChange={(e) =>
                      setSprinklerFormData((prev) => ({
                        ...prev,
                        flowRate: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sprinklerFormData.active}
                    onChange={(e) =>
                      setSprinklerFormData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handleSprinklerDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowSprinklerModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSprinklerUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapViewer;
