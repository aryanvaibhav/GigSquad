"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Gig = {
  id: string;
  title: string;
  location: string;
  pay_per_day: number;
};

export default function DashboardPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [page, setPage] = useState(1);
  const limit = 4; // gigs per page

  // 🔁 Fetch gigs from backend
  const fetchGigs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (locationFilter) params.append("location", locationFilter);

      params.append("page", String(page));
      params.append("limit", String(limit));

      const res = await api.get(`/gigs?${params.toString()}`);

      const gigsArray = res?.data?.gigs || [];

      setGigs(gigsArray);
    } catch (err) {
      console.error("Error fetching gigs:", err);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Fetch when filters/page change
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchGigs();
    }, 300);

    return () => clearTimeout(delay);
  }, [search, locationFilter, page]);

  // 🔁 Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, locationFilter]);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Find Gigs
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border border-green-200 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="flex-1 p-2 border border-green-200 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-600">
            Loading gigs...
          </div>
        )}

        {/* Empty */}
        {!loading && gigs.length === 0 && (
          <div className="text-center text-gray-600">
            No gigs found
          </div>
        )}

        {/* Gig List */}
        <div className="grid md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="bg-white p-4 rounded-xl border border-green-200 shadow-sm"
            >
              <h2 className="text-lg font-medium text-gray-800">
                {gig.title}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                📍 {gig.location}
              </p>

              <p className="text-sm font-medium mt-1 text-gray-700">
                ₹{gig.pay_per_day}/day
              </p>

              <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                Apply
              </button>
            </div>
          ))}
        </div>

        {/* ✅ PAGINATION CONTROLS */}
        {!loading && gigs.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            
            {/* Previous */}
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-4 py-2 rounded-md text-sm
                ${
                  page === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              Previous
            </button>

            {/* Page Info */}
            <span className="text-sm text-gray-700">
              Page {page}
            </span>

            {/* Next */}
            <button
              disabled={gigs.length < limit}
              onClick={() => setPage((prev) => prev + 1)}
              className={`px-4 py-2 rounded-md text-sm
                ${
                  gigs.length < limit
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}