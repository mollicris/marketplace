"use client";

import Head from 'next/head';
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useUserRole } from "../hooks/scaffold-eth/useUserRole";
import Hero from "~~/components/Hero";
import Features from "~~/components/Features";
import HowItWorks from "~~/components/HowItWorks";
import FeaturedNFTs from "~~/components/FeaturesNFTs";
import { useEffect } from "react";

const Home: NextPage = () => {

  const { role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role === "admin" || role === "moderator") {
      router.replace("/admin");
    } else if (role === "user") {
      // router.replace("/marketplace");
    }
    // guest se queda en Home
  }, [role, router]);

  return (

    <div className="min-h-screen bg-base-100">
      <Head>
        <title>IntiChain | Marketplace de NFTs Premium</title>
        <meta name="description" content="Marketplace de NFTs para artistas digitales y coleccionistas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <HeaderMain /> */}
      <Hero />
      <Features />
      <HowItWorks />
      <FeaturedNFTs />
    </div>

  );
};

export default Home;
