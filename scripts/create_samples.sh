
#following example and some data from https://memememememememe.me/post/training-haar-cascades/

classifier_w=48
classifier_h=30

#to build the tool: cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_opencv_apps=ON -DBUILD_SHARED_LIBS=OFF ../opencv

exiftool -q -r -if '$ImageHeight < ${classifier_h}' -if '$ImageWidth < ${classifier_w}' -p '$Directory/$FileName' "negatives" | xargs rm

rm -f negatives/negatives.txt
cd negatives
ls -l1 *.jpg > negatives.txt
cd ..

CV_APP_PATH=./bin/darwin

#apps built statically from opencv source: 
#cmake -DCMAKE_BUILD_TYPE=DEBUG -DBUILD_opencv_apps=ON -DBUILD_SHARED_LIBS=OFF ../opencv

rm -rf samples
mkdir -p samples

index=0
gen=128

#find "negatives" -iname "*.jpg" -type f | xargs -I{} identify -format '%w %h %i' {} | awk '$1<640 || $2<480'

find "positives" \( -iname \*.jpg -o -iname \*.jpeg \) -print0 | while read -r -d $'\0' file; do
  # base="${file##*/}" $base is the file name with all the directory stuff stripped off
  # dir="${file%/*}    $dir is the directory with the file name stripped off
  # echo "$file"
  INFO_PATH="samples/samples_${index}.txt"

  echo "Processing image ${file}"

  	seed=$((10000 + $RANDOM % 10000))

	${CV_APP_PATH}/opencv_createsamples \
		-rngseed ${seed} \
		-img ${file} \
		-bg negatives/negatives.txt \
		-info ${INFO_PATH} \
		-num ${gen} \
		-w ${classifier_w} -h ${classifier_h}

	if [[ -f "$INFO_PATH" ]]; then
		index=`expr $index + 1`
	fi
done

cd samples
cat samples_*.txt > samples.txt
cd ..

${CV_APP_PATH}/opencv_createsamples \
	-info samples/samples.txt \
	-bg negatives/negatives.txt \
	-vec data/cropped-${classifier_w}-${classifier_h}.vec \
	-num 1920 -w ${classifier_w} -h ${classifier_h}


