import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { MapImage } from "../services/api";

function Dashboard() {
  const { user } = useAuth();
  const [maps, setMaps] = useState<MapImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserMaps();
    }
  }, [user?.id]);

  const fetchUserMaps = async () => {
    try {
      setLoading(true);
      console.log("User object:", user);
      console.log("User ID:", user?.id);
      
      if (!user?.id) {
        console.log("No user ID found, returning early");
        return;
      }

      console.log("Making API call to:", `/maps?userId=${user.id}`);
      const response = await api.get<MapImage[]>(`/maps?userId=${user.id}`);

      console.log(response);

      if (response.data.success && response.data.data) {
        setMaps(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch maps");
      }
    } catch (err) {
      console.error("Error fetching maps:", err);
      setError("Failed to fetch maps");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this map? This will also delete all sprinklers on this map."
      )
    ) {
      return;
    }

    try {
      if (!user?.id) return;

      const response = await api.delete<void>(`/maps/${mapId}`, {
        data: { userId: user.id },
      });

      if (response.data.success) {
        setMaps(maps.filter((map) => map.id !== mapId));
      } else {
        alert(response.data.message || "Failed to delete map");
      }
    } catch (err) {
      console.error("Error deleting map:", err);
      alert("Failed to delete map");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName}! Manage your irrigation maps and
              sprinklers.
            </p>
          </div>
          <Link
            to="/maps/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Upload New Map
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {maps.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maps</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first irrigation map.
            </p>
            <div className="mt-6">
              <Link
                to="/maps/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Your First Map
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <div
                key={map.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {map.title}
                  </h3>
                  {map.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {map.description}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg
                      className="mr-1.5 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Uploaded {formatDate(map.uploadedAt)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg
                        className="mr-1.5 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {map.sprinklers.length} sprinklers
                    </span>
                    <span className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          map.sprinklers.some((s) => s.active)
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      {map.sprinklers.filter((s) => s.active).length} active
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/maps/${map.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md text-center transition duration-150 ease-in-out"
                    >
                      View & Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteMap(map.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
