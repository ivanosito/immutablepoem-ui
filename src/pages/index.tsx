import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../utils/ImmutablePoemABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

type Poem = {
  title: string;
  content: string;
  author: string;
  timestamp: bigint;
  totalStars: bigint;
  totalRatings: bigint;
};

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [poemId, setPoemId] = useState("");
  const [poem, setPoem] = useState<Poem | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<string | null>(null);

  async function connectWallet() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletConnected(true);
    }
  }

  async function publishPoem() {
    if (!title || !content) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    const tx = await contract.publishPoem(title, content);
    await tx.wait();
    alert("Poem published!");
  }

  async function fetchPoem() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
    const result = await contract.getPoemStruct(parseInt(poemId));
    setPoem(result);

    const avg = await contract.getAverageRating(parseInt(poemId));
    setAverageRating(avg.toString());
  }

  async function ratePoem() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    const tx = await contract.ratePoem(parseInt(poemId), rating);
    await tx.wait();
    alert("Thanks for rating!");
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">ImmutablePoem ✍️</h1>

      {!walletConnected && (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Connect Wallet
        </button>
      )}

      <section>
        <h2 className="text-xl font-semibold">Publish a Poem</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="block border p-2 w-full" />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="block border p-2 w-full mt-2" />
        <button onClick={publishPoem} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Publish</button>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Read & Rate a Poem</h2>
        <input type="number" placeholder="Poem ID" value={poemId} onChange={(e) => setPoemId(e.target.value)} className="block border p-2 w-full" />
        <button onClick={fetchPoem} className="mt-2 bg-purple-500 text-white px-4 py-2 rounded">Fetch Poem</button>

        {poem && (
          <div className="mt-4 border p-4 rounded">
            <h3 className="text-lg font-bold">{poem.title}</h3>
            <p className="italic">by {poem.author}</p>
            <p className="mt-2">{poem.content}</p>
            <p className="mt-2">Average Rating: {averageRating ?? "Not rated yet"}</p>
          </div>
        )}

        <div className="mt-4">
          <label className="block">Rate this poem (1–5):</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="block border p-2 w-full max-w-xs"
          />
          <button onClick={ratePoem} className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded">Submit Rating</button>
        </div>
      </section>
    </main>
  );
}
