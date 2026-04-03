import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LocationProvider } from "../context/LocationContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LocationProvider>
      <Component {...pageProps} />
    </LocationProvider>
  );
}
