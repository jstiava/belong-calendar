
import { useTheme } from '@mui/material';
import React, { useState, useEffect } from 'react';

interface BackgroundImageProps {
  url: string;
  height: string;
  width: string;
  style?: any;
}

export default function BackgroundImage({ url, height, width, style = {} }: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const theme = useTheme();

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(false);
  }, [url]);

  if (!isLoaded) {
    return (
      <div
        style={{
          width: width,
          height: height,
          backgroundColor: theme.palette.primary.main,
          backgroundPosition: 'center',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          ...style,
        }}
      />
    )

  }

  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        ...style,
      }}
    />
  );
}

interface BackgroundImageGalleryProps {
  base: string,
  keys: string[],
  width: string,
  height: string,
  style?: any
}

export function BackgroundImageGallery({ base, keys, height, width, style = {} }: BackgroundImageGalleryProps) {
  console.log(keys)
  return (
    <>
      {(keys && keys.length === 1) && (
        <BackgroundImage url={`${base}/${keys[0]}`} width={width} height={height} style={style} />
      )}
      {(keys && keys.length === 2) && (
        <div style={{ width: width, height: height, display: 'flex' }}>
          <BackgroundImage url={`${base}/${keys[0]}`} width={"50%"} height={height} />
          <BackgroundImage url={`${base}/${keys[1]}`} width={"50%"} height={height} />
        </div>
      )}
      {(keys && keys.length >= 3) && (
        <div style={{ width: width, height: height, display: 'flex' }}>
          <BackgroundImage url={`${base}/${keys[0]}`} width={"60%"} height={height} />
          <div style={{ height: height, width: "40%", display: 'flex', flexDirection: 'column' }}>
            <BackgroundImage url={`${base}/${keys[1]}`} width={"100%"} height={"50%"} />
            <BackgroundImage url={`${base}/${keys[2]}`} width={"100%"} height={"50%"} />
          </div>
        </div>
      )}
    </>
  )
}


interface PortraitImageProps {
  path: string,
  diameter: string,
  style?: any
}


export function PortraitImage({ path, diameter, style = {} }: PortraitImageProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = path;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(false);
  }, [path]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div
      style={{
        ...style,
        boxSizing: "content-box",
        width: diameter,
        height: diameter,
        borderRadius: "50%",
        backgroundImage: `url(${path})`,
        backgroundSize: style.backgroundSize || '105%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 4s ease-in-out',
        flexShrink: 0,
      }}
    />
  );
}