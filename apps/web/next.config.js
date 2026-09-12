/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.ufs.sh',
            }
        ],
    }
};

export default nextConfig;
