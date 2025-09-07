export interface NFT {
    id: number;
    title: string;
    artist: string;
    price: string;
    image: string;
    badge: string;
    badgeColor: string;
    likes: number;
    action: string;
}

export interface Feature {
    title: string;
    description: string;
    icon: string;
    color: string;
    buttonText: string;
}

export interface Step {
    number: number;
    title: string;
    description: string;
    icon: string;
}

export interface Stat {
    value: number;
    title: string;
    desc: string;
    icon: string;
}