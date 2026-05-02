import Image, { type ImageProps } from 'next/image';

type AppImageProps = ImageProps & {
  unoptimized?: boolean;
};

const AppImage = ({ unoptimized = true, ...props }: AppImageProps) => (
  <Image {...props} unoptimized={unoptimized} />
);

export default AppImage;
