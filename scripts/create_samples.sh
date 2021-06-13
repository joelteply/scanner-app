
#following example and some data from https://memememememememe.me/post/training-haar-cascades/

rm -f negatives/negatives.txt
ls -l1 negatives/*.jpg > negatives.txt

CV_APP_PATH=./bin/darwin

#apps built statically from opencv source: 
#cmake -DCMAKE_BUILD_TYPE=DEBUG -DBUILD_opencv_apps=ON -DBUILD_SHARED_LIBS=OFF ../opencv

rm -rf samples
mkdir -p samples

index=0
gen=128

find "positives" \( -iname \*.jpg -o -iname \*.jpeg \) -print0 | while read -r -d $'\0' file; do
  # base="${file##*/}" $base is the file name with all the directory stuff stripped off
  # dir="${file%/*}    $dir is the directory with the file name stripped off
  # echo "$file"
  IMG_PATH="${file}"
  INFO_PATH=samples/samples_${index}.txt

  echo "Processing ${IMG_PATH}"

	${CV_APP_PATH}/opencv_createsamples \
		-img ${file} \
		-bg negatives.txt \
		-info ${INFO_PATH} \
		-num ${gen} -maxxangle 0.0 -maxyangle 0.0 \
		-maxzangle 0.3 -bgcolor 255 -bgthresh 8 \
		-w 48 -h 30

	if [[ -f "$INFO_PATH" ]]; then
		index=`expr $index + 1`
	fi

done