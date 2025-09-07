"use client";

import Link from "next/link";
import Head from 'next/head';
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import Hero from "~~/components/Hero";
import Features from "~~/components/Features";
import HowItWorks from "~~/components/HowItWorks";
import FeaturedNFTs from "~~/components/FeaturesNFTs";
import HeaderMain from "~~/components/HeaderMain";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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
