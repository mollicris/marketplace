"use client";

import Head from "next/head";
import type { NextPage } from "next";
import Features from "~~/components/Features";
import FeaturedNFTs from "~~/components/FeaturesNFTs";
import Hero from "~~/components/Hero";
import HowItWorks from "~~/components/HowItWorks";

const Home: NextPage = () => {
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
