
#following example and some data from https://memememememememe.me/post/training-haar-cascades/

cd negatives
rm -f negatives.txt
ls -l1 *.jpg > negatives.txt
cd ../

opencv_createsamples -img cropped00.jpg \
-bg negatives/negatives.txt \
-info samples/cropped00.txt \
-num 128 -maxxangle 0.0 -maxyangle 0.0 \
-maxzangle 0.3 -bgcolor 255 -bgthresh 8 \
-w 48 -h 48