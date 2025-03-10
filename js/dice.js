document.getElementById("runLi").onclick = function() {
   // check if any of the results files exist, if so warn user
    // see if the results folder exists:
    var fileName = fullPath('results','');
    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            if (confirm('existing results files found in the working directory, overwrite?')) {
                // delete any existing results files
                fs.readdirSync(fullPath('results','')).forEach(file => {
                    // check if the file matches the syntax         
                    if(file.indexOf('DICe_solution_') !== -1){
                        fs.unlink(fullPath('results',file), (err) => {
                            if (err) throw err;
                            console.log('successfully deleted existing results file'+file);
                        });
                    }
                });
                // all the input file writes are chained via callbacks with the
                // last callback executing DICe
                startProgress();
                writeInputFile(false);
                $("#abortLi").show();
                $("#sssigPreview").hide();
            }else{
                return false;
            }
        }else {
            // all the input file writes are chained via callbacks with the
            // last callback executing DICe
            startProgress();
            writeInputFile(false);
            $("#abortLi").show();
            $("#sssigPreview").hide();
        }
    });
};

//document.getElementById("resolutionLi").onclick = function() {
//    // check if there are existing results
//    var fileName = fullPath('synthetic_results','spatial_resolution.txt');
//    fs.stat(fileName, function(err, stat) {
//        if(err == null) {            
//            if (confirm('existing results found, click "OK" to plot these results or "Cancel" to recompute')) {
//                localStorage.setItem("workingDirectory",workingDirectory);
//                var win = new BrowserWindow({ width: 850, height: 1000 });
//                win.on('closed', () => {
//                    win = null
//                })
//                win.loadURL('file://' + __dirname + '/resolution.html');                
//            }else{
//                fs.unlink(fileName, (err) => {
//                    if (err) throw err;
//                    console.log('successfully deleted '+fileName);
//                    startProgress();
//                    writeInputFile(false,true);
//                }) // end unlink                
//            } // end else confirm
//        } // end null
//        else{ // files don't exist to run the analysis
//            startProgress();
//            writeInputFile(false,true);
//        }
//    }); // end stat
//};

document.getElementById("sssigPreview").onclick = function() {
    if(refImagePathLeft=="undefined") return;
    else{
        startProgress();
        writeInputFile(false,false,true);
    }
};

document.getElementById("writeLi").onclick = function() {
    writeInputFile(true);
};

function integerLength(integer) {
    return integer.toString().length;
}

// global variable to see if there is already a live plot visible
var livePlotWin = null;
var livePlotLineWin = null;
function showLivePlots(){
    var online = navigator.onLine;
    // disable live plots when working offline
    if(!online){
	alert('Live plots are disabled when working offline');
        return;
    }

    localStorage.clear();
    localStorage.setItem("workingDirectory",workingDirectory);
    if($("#analysisModeSelect").val()=="tracking"){
        var livePlotFiles = '';
        var numDigitsTotal = integerLength(ROIDefsX.length);
        // set up the files to read
        for(i=0;i<ROIDefsX.length;++i){
            if(os.platform()=='win32'){
                livePlotFiles += 'results\\';
            }else{
                livePlotFiles += 'results/';
            }
            var currentDigits = integerLength(i);
            var numZeros = Number(numDigitsTotal) - Number(currentDigits);
            livePlotFiles += 'DICe_solution_';
            for(j=0;j<numZeros;++j)
                livePlotFiles += '0';
            livePlotFiles += i + '.txt';
            if(i<ROIDefsX.length-1)
                livePlotFiles += ' ';
        }
        localStorage.setItem("livePlotFiles", livePlotFiles);
        //alert('live plot win is ' + livePlotWin);
        if(livePlotWin !== null && typeof livePlotWin === 'object'){
            //livePlotWin.close();
        }else{
            livePlotWin = new BrowserWindow({ width: 1155, height: 800 });
        }
        livePlotWin.on('closed', () => {
            livePlotWin = null;
        })
        livePlotWin.loadURL('file://' + __dirname + '/live_plot.html');
        return;
    }
    if(livePlotPtsX.length <=0 && !addLivePlotLineActive) return;
    if(livePlotPtsX.length >0){
        var livePlotFiles = ""
        // TODO set up the files to read
        //livePlotFiles = "DICe_solution_0.txt DICe_solution_1.txt DICe_solution_2.txt DICe_solution_3.txt DICe_solution_4.txt DICe_solution_5.txt DICe_solution_6.txt";
        for(i=0;i<livePlotPtsX.length;++i){
            livePlotFiles += 'live_plot_pt_' + i + '.txt';
            if(i<livePlotPtsX.length-1)
                livePlotFiles += ' ';
        }
        localStorage.setItem("livePlotFiles", livePlotFiles);
        //alert('live plot win is ' + livePlotWin);
        if(livePlotWin !== null && typeof livePlotWin === 'object'){
            //livePlotWin.close();
        }else{
            livePlotWin = new BrowserWindow({ width: 1155, height: 800 });
        }
        livePlotWin.on('closed', () => {
            livePlotWin = null;
        })
        livePlotWin.loadURL('file://' + __dirname + '/live_plot.html');
    }
    if(addLivePlotLineActive){
        if(livePlotLineWin !== null && typeof livePlotLineWin === 'object'){
        }else{
            livePlotLineWin = new BrowserWindow({ width: 1155, height: 800 });
        }
        livePlotLineWin.on('closed', () => {
            livePlotLineWin = null;
        })
        livePlotLineWin.loadURL('file://' + __dirname + '/live_plot_line.html');
    }
}

function resetWorkingDirectory(){
        $("#refImageText span").text('');
        $("#refImageTextRight span").text('');
        $("#refImageTextMiddle span").text('');
        $("#defImageListLeft").empty();
        $("#defImageListRight").empty();
        $("#defImageListMiddle").empty();

        $("#imageFolderSpan").text('');
        $("#imageSequencePreviewSpan").text('');
        $("#imagePrefix").val('');
        $("#refIndex").val(0);
        $("#startIndex").val(0);
        $("#endIndex").val(0);
        $("#skipIndex").val(1);
        $("#numDigits").val(1);
        $("#stereoLeftSuffix").val('_0');
        $("#stereoRightSuffix").val('_1');
        $("#stereoMiddleSuffix").val('_2');
        $("#imageExtension").val('');

        $("#cineLeftPreviewSpan").text('');
        $("#cineRightPreviewSpan").text('');
        $("#cineMiddlePreviewSpan").text('');
        $("#cineStartPreviewSpan").text('');
        $("#cineEndPreviewSpan").text('');
        $("#cineRefIndex").val(0);
        $("#cineStartIndex").val(0);
        $("#cineEndIndex").val(0);
        $("#cineSkipIndex").val(1);
        
        $("#calList").empty();
        clearDrawnROIs();
        clearROIs();
        clearExcluded();
        clearObstructed();
        $("#runLoader").removeClass('post-loader-success');
        $("#runLoader").removeClass('post-loader-fail');
        $("#runLoader").removeClass('loader');    

        $("#panzoomLeft").html('');
        $("#panzoomRight").html('');
        $("#panzoomMiddle").html('');

        $("#previewCross").hide();
        $("#initCross").hide();

        refImagePathLeft = "undefined";
        refImagePathRight = "undefined";
        refImagePathMiddle = "undefined";
        cinePathLeft = "undefined";
        cinePathRight = "undefined";
        cinePathMiddle = "undefined";
        calPath = "undefined";

        deleteDisplayImageFiles(0);
        deleteDisplayImageFiles(1);
        deleteDisplayImageFiles(2);
}

document.getElementById("clearLi").onclick = function() {
    if (confirm('clear working directory?\n\nThis action will clear the reference and deformed images, remove all ROIs, and reset the calibration file. Saved input files in this working directory will not be erased.')) {
        resetWorkingDirectory();
    }else{
        return false;
    }
};

document.getElementById("previewCross").onclick = function() {
    callCrossInitExec();
}
document.getElementById("clearCross").onclick = function() {
    var fileName = fullPath('','projection_points.dat');
    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            if (confirm('delete nonlinear warp seed file ' + fileName +'?')) {
                fs.unlink(fileName, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted '+fileName);
                });
                updateResultsFilesList();
            }else{
                return false;
            }
        }
    });
}
function callDICeExec(resolution,ss_locs) {

    // load the live plot viewer if there are any live plots:
    showLivePlots();
    
    // nuke the old line plot and point live plot files
    fs.readdirSync(workingDirectory).forEach(file => {
        // check if the file matches the syntax                                                                       
        if(file.indexOf('live_plot_line_step_') !== -1 || file.indexOf('live_plot_pt_') !== -1){
            fs.unlink(fullPath('',file), (err) => {
                if (err) throw err;
                console.log('successfully deleted old line plot file'+file);
            });
        }
    });

    var inputFile = fullPath('','input.xml');
    var child_process = require('child_process');
    var readline = require('readline');

    var child;// = child_process.spawn('<process>', [<arg1>, <arg2>]);
    if(ss_locs)
        child = child_process.spawn(execPath, ['-i',inputFile,'-v','-t','--ss_locs'],{cwd:workingDirectory});
    else
        child = child_process.spawn(execPath, ['-i',inputFile,'-v','-t'],{cwd:workingDirectory});

    child.stdout.on('data', function (data) {
        if(diceDebugMsgOn){
            consoleMsg(data.toString());
        }
    });

    if(!diceDebugMsgOn){
        readline.createInterface({
            input     : child.stdout,
            terminal  : false
        }).on('line', function(line) {
            consoleMsg(line);
        });
    }

    child.on('error', function(){
        alert('DICe execution failed: invalid executable: ' + execPath);
        endProgress(false);
        $("#abortLi").hide();
        $("#sssigPreview").show();
    });

    $("#abortLi").on('click',function(){
        child.kill();
        $("#abortLi").hide();
    });

    child.stderr.on('data', function (data) {
        consoleMsg(data);
        alert('DICe execution failed: invalid executable: ' + execPath);
        endProgress(false);
        $("#abortLi").hide();
        $("#sssigPreview").show();
    });

    child.on('close', function (code) {
        console.log(`child process exited with code ${code}`);
        updateResultsFilesList();
        $("#abortLi").hide();
        $("#sssigPreview").show();
        if(code!=0){
            alert('DICe execution failed (see console for details)');
            endProgress(false);
        }
        else{
            endProgress(true);
            resultsFresh = true;
            ROIsChanged = false;
            if(resolution){
                localStorage.setItem("workingDirectory",workingDirectory);
                var win = new BrowserWindow({ width: 850, height: 1000 });
                win.on('closed', () => {
                    win = null
                })
                win.loadURL('file://' + __dirname + '/resolution.html');
                //win.webContents.openDevTools()
            }else if(ss_locs){
                drawDotsAndBoxesForSubsets();
            }else{
                postExecTasks();
            }
        }
    });
    
//    var readline      = require('readline');
//    var proc;
//    if(ss_locs)
//        proc = child_process.execFile(execPath, ['-i',inputFile,'-v','-t','--ss_locs'],{cwd:workingDirectory,maxBuffer:1024*1024});
//    else
//        proc = child_process.execFile(execPath, ['-i',inputFile,'-v','-t'],{cwd:workingDirectory,maxBuffer:1024*1024});
//        
}

function updateCineDisplayImage(fileName,index,mode,reset_ref_ROIs){
    var child_process = require('child_process');
    var readline      = require('readline');
    var tiffImageName = fullPath('','.display_image_');
    if(mode==0)
        tiffImageName += 'left.tif';
    else if(mode==1)
        tiffImageName += 'right.tif';
    else
        tiffImageName += 'middle.tif';
    consoleMsg("converting file " + fileName + " index " + index + " to .tif for display");
    var procConv = child_process.spawn(execCineToTiffPath, [fileName,index,index,tiffImageName],{cwd:workingDirectory});//,maxBuffer:1024*1024})
        readline.createInterface({
            input     : procConv.stdout,
            terminal  : false
        }).on('line', function(line) {
            consoleMsg(line);
        });
        procConv.on('error', function(){
            alert('DICe .cine file converstion to .tiff failed: invalid executable: ' + execCineToTiffPath);
        });
        procConv.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if(code!=0){
                 alert('DICe .cine file conversion to .tiff failed');
            }
            else{
		if(mode==0){
                    getFileObject(tiffImageName, function (fileObject) {
                        loadImage(fileObject,"#panzoomLeft","auto","auto",1,false,reset_ref_ROIs,"","",true,function(){if($("#binaryAutoUpdateCheck")[0].checked) callOpenCVServerExec();});
                    });
                }else if(mode==1){
                    getFileObject(tiffImageName, function (fileObject) {
                        loadImage(fileObject,"#panzoomRight","auto","auto",1,false,false,"","",true,function(){if($("#binaryAutoUpdateCheck")[0].checked) callOpenCVServerExec();});
                    });
                }else{
                    getFileObject(tiffImageName, function (fileObject) {
                        loadImage(fileObject,"#panzoomMiddle","auto","auto",1,false,false,"","",true,function(){if($("#binaryAutoUpdateCheck")[0].checked) callOpenCVServerExec();});
                    });
                }
            }
        });
}


function callCineStatExec(file,mode,reset_ref_ROIs,callback) {

    var child_process = require('child_process');
    var readline      = require('readline');
    var proc;

    var fileName = file.path;
    console.log('loading cine file: ' + file.path)
    fs.stat(fileName, function(err, stat) {
        if(err != null) {
            alert("could not find .cine file: " + fileName);
            return false;
        }
        else{
            console.log("getting frame range of cine file: " + fileName);
            var proc = child_process.spawn(execCineStatPath, [fileName],{cwd:workingDirectory});//,maxBuffer:1024*1024})
        }
        readline.createInterface({
            input     : proc.stdout,
            terminal  : false
        }).on('line', function(line) {
            consoleMsg(line);
        });
        proc.on('error', function(){
            alert('DICe .cine file stat failed: invalid executable: ' + execCineStatPath);
            return false;
        });
        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if(code!=0){
                alert('DICe .cine file stat failed');
                return false;
            }
            else{
                // read the output file:
                var statFileName = fullPath('','cine_stats.dat');
                fs.stat(statFileName, function(err, stat) {
                    if(err != null) {
                        alert("could not find .cine stats file: " + statFileName);
                        return false;
                    }else{
                         fs.readFile(statFileName, 'utf8', function (err,data) {
                             if (err) {
                                 console.log(err);
                                 return false;                  
                             }
                             var stats = data.toString().split(/\s+/g).map(Number);
                             //alert(stats[0]);
                             //alert(stats[1]);
                             //alert(stats[2]);
                             // check that the two cine files have valid frame ranges
                             if($("#cineStartPreviewSpan").text()!=""||$("#cineEndPreviewSpan").text()!="")
                                 if($("#cineStartPreviewSpan").text()!=stats[1]||$("#cineEndPreviewSpan").text()!=stats[2]){
                                     alert("Error, all .cine files need to have matching frame ranges");
                                     return false;
                                 }
                             cineFirstFrame = stats[1];
                             $("#cineStartPreviewSpan").text(stats[1]);
                             $("#cineCurrentPreviewSpan").text(stats[1]);
                             $("#cineEndPreviewSpan").text(stats[2]);
                             if(mode==0){
                                 $("#cineRefIndex").val(stats[1]);
                                 $("#cineStartIndex").val(stats[1]);
                                 $("#cineEndIndex").val(stats[2]);
                                 $("#frameScroller").attr('max',stats[2]);
                                 $("#frameScroller").attr('min',stats[1]);
                                 $("#frameScroller").val(stats[1]);
                             }
                             // convert the cine to tiff
                             // always start with the ref index for the initial display
                             if(mode==0){
                                 cinePathLeft = file.path;
                                 $("#cineLeftPreview span").text(file.name);
                             }else if(mode==1){
                                 cinePathRight = file.path;
                                 $("#cineRightPreview span").text(file.name);
                             }else if(mode==2){
                                 cinePathMiddle = file.path;
                                 $("#cineMiddlePreview span").text(file.name);
                             }
                             deleteDisplayImageFiles(mode,function(){updateCineDisplayImage(fileName,stats[1],mode,reset_ref_ROIs);});
                             callback = callback || $.noop;
                             callback();
                             return true;
                         }); // end else                           
                    }
                });
            }
        }); // end proc.on    
    }); // end fileName fs.stat
}

var binaryElements = document.getElementsByClassName("filterOption");
for (var i = 0; i < binaryElements.length; i++) {
    binaryElements[i].addEventListener('change', function() {
        if(!$("#binaryAutoUpdateCheck")[0].checked) return;
        callOpenCVServerExec();
  });
}

var blobElements = document.getElementsByClassName("blobOption");
for (var i = 0; i < blobElements.length; i++) {
    blobElements[i].addEventListener('change', function() {
        // convert the id into the right label
        var inputId = $(this).attr('id');
        var spanLabel = '#' + inputId + 'Label';
        var otherInputId = inputId.substr(0,inputId.length-3);
        // ensure that the max is always greater than the min
        var lastThree = inputId.substr(inputId.length - 3);
        if(lastThree == "Max"){
            otherInputId = '#' + otherInputId + 'Min';
            var otherVal = $(otherInputId).val();
            if(+$(this).val() < +otherVal){
                $(this).val(otherVal);
            }
        }else{
            otherInputId = '#' + otherInputId + 'Max';
            var otherVal = $(otherInputId).val();
            console.log('val is ' + $(this).val() + ' other val is ' + otherVal);
            if(+$(this).val() > +otherVal){
                $(this).val(otherVal);
            }
        }        
        $(spanLabel).text($(this).val());
  });
}

function callOpenCVServerExec() {
    if($("#analysisModeSelect").val()!="tracking") return;
    // check to see that there is at least one image selected:
    if(refImagePathLeft=='undefined'&&refImagePathRight=='undefined'&&refImagePathMiddle=='undefined') return;
    
    // check to see if any filters are applied:
    if(!$("#binaryCheck")[0].checked&&!$("#blobCheck")[0].checked){
        return;
    }
    // generate the command line
    var args = [];
    // get the files to filter:
    fs.readdir(workingDirectory, (err,dir) => {
        for(var i = 0; i < dir.length; i++) {
            if(dir[i].includes('.display_image')&&!dir[i].includes('filter')){
                args.push(dir[i]);
                args.push(dir[i].replace('.'+dir[i].split('.').pop(),"_filter.png"));
            }
        }
        if($("#binaryCheck")[0].checked){
            args.push('Filter:BinaryThreshold');
            if($("#binarySelect").val()=="binaryMean"){
                args.push(1);
            }else{
                args.push(0);
            }
            args.push($("#binaryThreshBlockSize").val());
            args.push($("#binaryThreshConstant").val());
            if($("#binaryInvertedCheck")[0].checked){
                args.push(1);
            }else{
                args.push(0);
            }            
        }
        if($("#blobCheck")[0].checked){
            args.push('Filter:Blob');
            if($("#blobAreaCheck")[0].checked){
                args.push(1);
            }else{
                args.push(0);
            }            
            args.push($("#blobAreaMin").val());
            args.push($("#blobAreaMax").val());
            if($("#blobCircularityCheck")[0].checked){
                args.push(1);
            }else{
                args.push(0);
            }            
            args.push($("#blobCircularityMin").val());
            args.push($("#blobCircularityMax").val());
            if($("#blobEccentricityCheck")[0].checked){
                args.push(1);
            }else{
                args.push(0);
            }            
            args.push($("#blobEccentricityMin").val());
            args.push($("#blobEccentricityMax").val());
            if($("#blobConvexityCheck")[0].checked){
                args.push(1);
            }else{
                args.push(0);
            }            
            args.push($("#blobConvexityMin").val());
            args.push($("#blobConvexityMax").val());
        }
        consoleMsg('calling OpenCVServerExec with args ' + args);    
    
        // call the filter exec
        var child_process = require('child_process');
        var readline      = require('readline');
        var proc = child_process.spawn(execOpenCVServerPath,args,{cwd:workingDirectory});//,maxBuffer:1024*1024});

        proc.on('error', function(){
            alert('DICe OpenCVServer failed: invalid executable: ' + execOpenCVServerPath);
        });
        proc.on('close', (code) => {
            console.log(`OpenCVServer exited with code ${code}`);
            if(code!=0){
                alert('OpenCVServer failed');
            }
            else{
                // load new preview images
                fs.stat(fullPath('','.display_image_left_filter.png'), function(err, stat) {
                    if(err == null) {
                        getFileObject(fullPath('','.display_image_left_filter.png'), function (fileObject) {
                            loadImage(fileObject,"#panzoomLeft","auto","auto",1,false,false,"","",false);
                        });                 
                    }else{
                    }
                });
                fs.stat(fullPath('','.display_image_right_filter.png'), function(err, stat) {
                    if(err == null) {
                        getFileObject(fullPath('','.display_image_right_filter.png'), function (fileObject) {
                            loadImage(fileObject,"#panzoomRight","auto","auto",1,false,false,"","",false);
                        });                 
                    }else{
                    }
                });
                fs.stat(fullPath('','.display_image_middle_filter.png'), function(err, stat) {
                    if(err == null) {
                        getFileObject(fullPath('','.display_image_middle_filter.png'), function (fileObject) {
                            loadImage(fileObject,"#panzoomMiddle","auto","auto",1,false,false,"","",false);
                        });                 
                    }else{
                    }
                });
            }
        });
        readline.createInterface({
            input     : proc.stdout,
            terminal  : false
        }).on('line', function(line) {
            consoleMsg(line);
        });
    });
}

function callCrossInitExec() {

    var child_process = require('child_process');
    var readline      = require('readline');
    var proc;

    // see if the projection_points.dat file exists:
    var fileName = fullPath('','projection_points.dat');
    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            console.log("found nonlinear seed file: projection_points.dat in the execution directory, enabling nonlinear warp");
            proc = child_process.spawn(execCrossInitPath, [refImagePathLeft,refImagePathRight,'1'],{cwd:workingDirectory});//,maxBuffer:1024*1024})
            startProgress();
        }
        else{
            console.log("nonlinear seed file projection_points.dat not found");
            proc = child_process.spawn(execCrossInitPath, [refImagePathLeft,refImagePathRight,'0'],{cwd:workingDirectory});//,maxBuffer:1024*1024})
            startProgress();
        }
        proc.stdout.on('data', function (data) {
            if(diceDebugMsgOn){
                consoleMsg(data.toString());
            }
        });
        if(!diceDebugMsgOn){
            readline.createInterface({
                input     : proc.stdout,
                terminal  : false
            }).on('line', function(line) {
                consoleMsg(line);
            });
        }
        //readline.createInterface({
        //    input     : proc.stdout,
        //    terminal  : false
        //}).on('line', function(line) {                
        //    consoleMsg(line);
        //});
        proc.on('error', function(){
            alert('DICe cross correlation initialization failed: invalid executable: ' + execCrossInitPath);
            endProgress(false);
        });
        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            updateResultsFilesList();
            if(code!=0){
                alert('DICe cross correlation initialization failed (may need to seed a nonlinear warp for this image set)');
                endProgress(false);
             }
            else{
                endProgress(true);
                // loadpreview window ...
                openPreviewCross();
             }
        });    
    });
}

function postExecTasks(){
    if(paraviewMsg){
        alert('Analysis successful\n\nView the results files using ParaView\nwhich can be freely downloaded at\nwww.paraview.org');
        paraviewMsg = false;
    }
    if($("#exportMovieCheck")[0].checked){
        consoleMsg('writing results movie to results folder');
        var child_process = require('child_process');
        var proc = child_process.spawn(execTrackingMoviePath,['input.xml'],{cwd:workingDirectory});
    }
}

function startProgress (){
    $("#runLoader").removeClass('post-loader-success');
    $("#runLoader").removeClass('post-loader-fail');
    $("#runLoader").addClass('loader');    
}
function endProgress (success){
    $("#runLoader").removeClass('loader');
    if(success){
        $("#runLoader").addClass('post-loader-success');
    }
    else {
        $("#runLoader").addClass('post-loader-fail');
    }
}

function writeInputFile(only_write,resolution=false,ss_locs=false) {
    fileName     = fullPath('','input.xml');
    outputFolder = fullPath('results','');
    paramsFile   = fullPath('','params.xml');
    subsetFile   = fullPath('','subset_defs.txt');
    consoleMsg('writing input file ' + fileName);
    var content = '';
    content += '<!-- Auto generated input file from DICe GUI -->\n';
    content += '<ParameterList>\n';
    content += '<Parameter name="output_folder" type="string" value="' + outputFolder + '" /> \n';
    content += '<Parameter name="correlation_parameters_file" type="string" value="' + paramsFile + '" />\n';
    if(ROIDefsX[0].length>=3){
        content += '<Parameter name="subset_file" type="string" value="' + subsetFile + '" />\n';
    }
    if(ROIDefsX[0].length==0&&$("#analysisModeSelect").val()=="global"){
        content += '<Parameter name="subset_file" type="string" value="' + subsetFile + '" />\n';
        // if no ROIs are defined for global, define one large ROI
        ROIDefsX[0].push(20);
        ROIDefsY[0].push(20);
        ROIDefsX[0].push(refImageWidthLeft-20);
        ROIDefsY[0].push(20);
        ROIDefsX[0].push(refImageWidthLeft-20);
        ROIDefsY[0].push(refImageHeightLeft-20);
        ROIDefsX[0].push(20);
        ROIDefsY[0].push(refImageHeightLeft-20);
    }
    if($("#analysisModeSelect").val()=="subset"){
        content += '<Parameter name="subset_size" type="int" value="'+$("#subsetSize").val()+'" />\n';
        content += '<Parameter name="step_size" type="int" value="'+$("#stepSize").val()+'" />\n';
        content += '<Parameter name="separate_output_file_for_each_subset" type="bool" value="false" />\n';
    }else if($("#analysisModeSelect").val()=="tracking"){
        content += '<Parameter name="separate_output_file_for_each_subset" type="bool" value="true" />\n';
    }else{
        content += '<Parameter name="mesh_size" type="double" value="'+$("#meshSize").val()+'" />\n';
    }
    content += '<Parameter name="create_separate_run_info_file" type="bool" value="true" />\n';
    if($("#omitTextCheck")[0].checked&&$("#analysisModeSelect").val()=="subset"){
        content += '<Parameter name="no_text_output_files" type="bool" value="true" />\n';
    }
    if((showStereoPane==1||showStereoPane==2)&&!resolution&&!ss_locs&&$("#analysisModeSelect").val()=="subset"){
        content += '<Parameter name="camera_system_file" type="string" value="' + calPath + '" />\n';
    }
    if(showStereoPane==0&&$("#calibrationCheck")[0].checked){
        content += '<Parameter name="camera_system_file" type="string" value="' + calPath + '" />\n';
    }
    var fileSelectMode = $("#fileSelectMode").val();
    if(fileSelectMode=="list"){
      content += '<Parameter name="image_folder" type="string" value="" />\n';
      content += '<Parameter name="reference_image" type="string" value="' + refImagePathLeft + '" />\n';
      content += '<ParameterList name="deformed_images">\n';
        // add the deformed images
        if(resolution||ss_locs){
            content += '<Parameter name="'+refImagePathLeft+'" type="bool" value="true" />\n';        
        }
        else{
            for(var i = 0, l = defImagePathsLeft.length; i < l; i++) {
                content += '<Parameter name="'+defImagePathsLeft[i].path+'" type="bool" value="true" />\n';        
            }
        }
      content += '</ParameterList>\n';
      if((showStereoPane==1||showStereoPane==2)&&!resolution&&!ss_locs&&$("#analysisModeSelect").val()=="subset"){
          content += '<Parameter name="stereo_reference_image" type="string" value="' + refImagePathRight + '" />\n';
          content += '<ParameterList name="stereo_deformed_images">\n';
          // add the deformed images
          for(var i = 0, l = defImagePathsRight.length; i < l; i++) {
              content += '<Parameter name="'+defImagePathsRight[i].path+'" type="bool" value="true" />\n';        
          }
          content += '</ParameterList>\n';
      }
    }
    else if(fileSelectMode=="sequence"){
        var folderName = $("#imageFolderSpan").text();
        if(os.platform()=='win32'){
            folderName += '\\';
        }else{
            folderName += '/';
        }
        content += '<Parameter name="image_folder" type="string" value="'+folderName +'" />\n';
        content += '<Parameter name="reference_image_index" type="int" value="'+$("#refIndex").val()+'" />\n';
        content += '<Parameter name="start_image_index" type="int" value="'+$("#startIndex").val()+'" />\n';
        content += '<Parameter name="end_image_index" type="int" value="'+$("#endIndex").val()+'" />\n';
        content += '<Parameter name="skip_image_index" type="int" value="'+$("#skipIndex").val()+'" />\n';
        content += '<Parameter name="num_file_suffix_digits" type="int" value="'+$("#numDigits").val()+'" />\n';
        content += '<Parameter name="image_file_extension" type="string" value="'+$("#imageExtension").val()+'" />\n';
        content += '<Parameter name="image_file_prefix" type="string" value="'+$("#imagePrefix").val()+'" />\n';
        if((showStereoPane==1||showStereoPane==2)&&$("#analysisModeSelect").val()=="subset"){
            content += '<Parameter name="stereo_left_suffix" type="string" value="'+$("#stereoLeftSuffix").val()+'"/>\n';
            content += '<Parameter name="stereo_right_suffix" type="string" value="'+$("#stereoRightSuffix").val()+'" />\n';
        }
    }
    else if(fileSelectMode=="cine"){
        content += '<Parameter name="image_folder" type="string" value="" />\n';
        content += '<Parameter name="cine_file" type="string" value="'+cinePathLeft+'" />\n';
        content += '<Parameter name="cine_ref_index" type="int" value="'+$("#cineRefIndex").val()+'" />\n';
        content += '<Parameter name="cine_start_index" type="int" value="'+$("#cineStartIndex").val()+'" />\n';
        content += '<Parameter name="cine_skip_index" type="int" value="'+$("#cineSkipIndex").val()+'" />\n';
        content += '<Parameter name="cine_end_index" type="int" value="'+$("#cineEndIndex").val()+'" />\n';
        if((showStereoPane==1||showStereoPane==2)&&!resolution&&!ss_locs&&$("#analysisModeSelect").val()=="subset"){
            content += '<Parameter name="stereo_cine_file" type="string" value="'+cinePathRight+'" />\n';
        }
    }
    content += '</ParameterList>\n';
    fs.writeFile(fileName, content, function (err) {
        if(err){
            alert("Error: an error ocurred creating the file "+ err.message)
         }
        consoleMsg('input.xml file has been successfully saved');
        writeParamsFile(only_write,resolution,ss_locs);
    });
}

function writeBestFitFile() {
            if($("#bestFitCheck")[0].checked&&$("#analysisModeSelect").val()=="subset"){
                var bestFitFile = fullPath('','best_fit_plane.dat');
                consoleMsg('writing best fit plane file ' + bestFitFile);
                var BFcontent = '';
                BFcontent += '# origin of the coordinate system\n';
                BFcontent += bestFitXOrigin + ' ' + bestFitYOrigin + '\n'
                BFcontent += '# point on the axis \n';
                BFcontent += bestFitXAxis + ' ' + bestFitYAxis;
                if($("#bestFitYAxisCheck")[0].checked){
                    BFcontent += ' YAXIS ';
                }
                BFcontent += '\n';
                fs.writeFile(bestFitFile, BFcontent, function (err) {
                if(err){
                    alert("Error: an error ocurred creating the file "+ err.message)
                }
                consoleMsg('best_fit_plane.dat file has been successfully saved');
                });
            }
}

function writeLivePlotsFile() {
    if((livePlotPtsX.length >0 || addLivePlotLineActive)&&($("#analysisModeSelect").val()=="subset"||$("#analysisModeSelect").val()=="global")){        
        var livePlotFile = fullPath('','live_plot.dat');
        consoleMsg('writing live plot data file ' + livePlotFile);
        var LPcontent = '';
        LPcontent += '# two numbers is a point four numbers is a line\n';
        for(i=0;i<livePlotPtsX.length;++i){
            LPcontent += livePlotPtsX[i] + ' ' + livePlotPtsY[i] + '\n'
        }
        if(addLivePlotLineActive){
            LPcontent += livePlotLineXOrigin + ' ' + livePlotLineYOrigin + ' ' + livePlotLineXAxis + ' ' + livePlotLineYAxis + '\n'            
        }
        fs.writeFile(livePlotFile, LPcontent, function (err) {
            if(err){
                 alert("Error: an error ocurred creating the file "+ err.message)
            }
            consoleMsg('live_plot.dat file has been successfully saved');
        });
    }
}


function writeParamsFile(only_write,resolution,ss_locs) {
    // delete the best_fit_plane.dat file if it exists
    var fileName = fullPath('','best_fit_plane.dat');
    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            fs.unlink(fileName, (err) => {
                if (err) throw err;
                console.log('successfully deleted '+fileName);
            });
            updateResultsFilesList();
            writeBestFitFile();
            // create a best_fit_plane.dat file if requested
        }else{
            writeBestFitFile();
        }
    });
    // delete the live_plot.dat file if it exists
    var LPFileName = fullPath('','live_plot.dat');
    fs.stat(LPFileName, function(err, stat) {
        if(err == null) {
            fs.unlink(LPFileName, (err) => {
                if (err) throw err;
                console.log('successfully deleted '+LPFileName);
            });
            updateResultsFilesList();
            writeLivePlotsFile();
        }else{
            writeLivePlotsFile();
        }
    });
    
    var paramsFile = fullPath('','params.xml');
    consoleMsg('writing parameters file ' + paramsFile);
    var content = '';
    content += '<!-- Auto generated parameters file from DICe GUI -->\n';
    content += '<ParameterList>\n';
    if(resolution){
        // add estimate spatial resoltion options
        content += '<Parameter name="estimate_resolution_error" type="bool" value="true" />\n';
        content += '<Parameter name="estimate_resolution_error_min_period" type="double" value="10.0" />\n';
        content += '<Parameter name="estimate_resolution_error_period_factor" type="double" value="0.73" />\n';
        content += '<Parameter name="estimate_resolution_error_min_amplitude" type="double" value="1.0" />\n';
        content += '<Parameter name="estimate_resolution_error_max_amplitude" type="double" value="1.0" />\n';
        content += '<Parameter name="estimate_resolution_error_amplitude_step" type="double" value="1.0" />\n';
    }
    content += '<Parameter name="interpolation_method" type="string" value="KEYS_FOURTH" />\n';
    if($("#analysisModeSelect").val()=="subset"){
        content += '<Parameter name="sssig_threshold" type="double" value="'+$("#sssigThresh").val()+'" />\n';
        content += '<Parameter name="optimization_method" type="string" value="GRADIENT_BASED" />\n';
        var initMode = $("#initSelect").val();
        if(initMode=="featureMatching"){
            content += '<Parameter name="initialization_method" type="string" value="USE_FEATURE_MATCHING" />\n';
        }
        if(initMode=="featureMatchingWThresh"){
            content += '<Parameter name="initialization_method" type="string" value="USE_FEATURE_MATCHING" />\n';
            content += '<Parameter name="threshold_block_size" type="int" value="' + $("#threshBlockSize").val() + '" />\n';
        }
        else if(initMode=="fieldValues"){
            content += '<Parameter name="initialization_method" type="string" value="USE_FIELD_VALUES" />\n';
        }
        else if(initMode=="imageRegistration"){
            content += '<Parameter name="initialization_method" type="string" value="USE_IMAGE_REGISTRATION" />\n';
        }
        else if(initMode=="neighborValues"){
            content += '<Parameter name="initialization_method" type="string" value="USE_NEIGHBOR_VALUES" />\n';
        }
        if($("#translationCheck")[0].checked){
            content += '<Parameter name="enable_translation" type="bool" value="true" />\n';
        }else{
            content += '<Parameter name="enable_translation" type="bool" value="false" />\n';
        }
        if($("#rotationCheck")[0].checked){
            content += '<Parameter name="enable_rotation" type="bool" value="true" />\n';
        }else{
            content += '<Parameter name="enable_rotation" type="bool" value="false" />\n';
        }
        if($("#normalStrainCheck")[0].checked){
            content += '<Parameter name="enable_normal_strain" type="bool" value="true" />\n';
        }else{
            content += '<Parameter name="enable_normal_strain" type="bool" value="false" />\n';
        }  
        if($("#shearStrainCheck")[0].checked){
            content += '<Parameter name="enable_shear_strain" type="bool" value="true" />\n';
        }else{
            content += '<Parameter name="enable_shear_strain" type="bool" value="false" />\n';
        }
        if($("#strainCheck")[0].checked){
            content += '<ParameterList name="post_process_vsg_strain">\n';
            content += '<Parameter name="strain_window_size_in_pixels" type="int" value="'+$("#strainGaugeSize").val()+'" />\n';
            content += '</ParameterList>\n';
        }
    }else if($("#analysisModeSelect").val()=="global"){
        content += '<Parameter name="max_solver_iterations_fast" type="int" value="500" />\n';
        content += '<Parameter name="global_solver" type="string" value="gmres_solver" />\n';
        content += '<Parameter name="global_formulation" type="string" value="horn_schunck" />\n';
        content += '<Parameter name="global_regularization_alpha" type="double" value="'+$("#regularizationConstant").val()+'" />\n';
        if($("#elementTypeSelect").val()=="TRI3"){
            content += '<Parameter name="global_element_type" type="string" value="TRI3" />\n';
        }else{
            content += '<Parameter name="global_element_type" type="string" value="TRI6" />\n';
        }
    }else{ // assume tracking at this point
        content += '<Parameter name="use_tracking_default_params" type="bool" value="true" />\n';
        content += '<Parameter name="normalize_gamma_with_active_pixels" type="bool" value="true" />\n';
        content += '<Parameter name="filter_failed_cine_pixels" type="bool" value="true" />\n';
        content += '<Parameter name="use_search_initialization_for_failed_steps" type="bool" value="true" />\n';
        content += '<Parameter name="obstruction_skin_factor" type="double" value="1.0" />\n';
        if($("#optModeSelect").val()=="simplex"){
            content += '<Parameter name="optimization_method" type="string" value="SIMPLEX" />\n';
            content += '<Parameter name="compute_image_gradients" type="bool" value="false" />\n';
        }else{
            content += '<Parameter name="compute_image_gradients" type="bool" value="true" />\n';
            content += '<Parameter name="optimization_method" type="string" value="GRADIENT_BASED_THEN_SIMPLEX" />\n';
        }
    }
    if($("#filterCheck")[0].checked){
        content += '<Parameter name="gauss_filter_images" type="bool" value="true" />\n';
        content += '<Parameter name="gauss_filter_mask_size" type="int" value="'+$("#filterSize").val()+'" />\n';
    }
    content += '<Parameter name="output_delimiter" type="string" value="," />\n'
    content += '<ParameterList name="output_spec"> \n';
    content += '<Parameter name="COORDINATE_X" type="bool" value="true" />\n';
    content += '<Parameter name="COORDINATE_Y" type="bool" value="true" />\n';
    content += '<Parameter name="DISPLACEMENT_X" type="bool" value="true" />\n';
    content += '<Parameter name="DISPLACEMENT_Y" type="bool" value="true" />\n';
    if((showStereoPane==1||showStereoPane==2)&&$("#analysisModeSelect").val()=="subset"||(showStereoPane==0&&$("#calibrationCheck")[0].checked)){
        content += '<Parameter name="MODEL_COORDINATES_X" type="bool" value="true" />\n';
        content += '<Parameter name="MODEL_COORDINATES_Y" type="bool" value="true" />\n';
        content += '<Parameter name="MODEL_COORDINATES_Z" type="bool" value="true" />\n';
        content += '<Parameter name="MODEL_DISPLACEMENT_X" type="bool" value="true" />\n';
        content += '<Parameter name="MODEL_DISPLACEMENT_Y" type="bool" value="true" />\n';
        content += '<Parameter name="MODEL_DISPLACEMENT_Z" type="bool" value="true" />\n';
    }
    if($("#analysisModeSelect").val()=="subset" && $("#initSelect").val()=="imageRegistration"){
        content += '<Parameter name="ROTATION_Z" type="bool" value="true" />\n';
    }
    if($("#analysisModeSelect").val()=="subset"){
        content += '<Parameter name="SIGMA" type="bool" value="true" />\n';
        content += '<Parameter name="GAMMA" type="bool" value="true" />\n';
        content += '<Parameter name="BETA" type="bool" value="true" />\n';
        content += '<Parameter name="STATUS_FLAG" type="bool" value="true" />\n';
        content += '<Parameter name="UNCERTAINTY" type="bool" value="true" />\n';
        if($("#strainCheck")[0].checked){
            content += '<Parameter name="VSG_STRAIN_XX" type="bool" value="true" />\n';
            content += '<Parameter name="VSG_STRAIN_YY" type="bool" value="true" />\n';
            content += '<Parameter name="VSG_STRAIN_XY" type="bool" value="true" />\n';
        }
    }else{
        content += '<Parameter name="ROTATION_Z" type="bool" value="true" />\n';
        content += '<Parameter name="SIGMA" type="bool" value="true" />\n';
        content += '<Parameter name="GAMMA" type="bool" value="true" />\n';
        content += '<Parameter name="BETA" type="bool" value="true" />\n';    
    }
    content += '</ParameterList>\n';
    content += '</ParameterList>\n';
    fs.writeFile(paramsFile, content, function (err) {
        if(err){
            alert("Error: an error ocurred creating the file "+ err.message)
         }
        consoleMsg('params.xml file has been successfully saved');
        writeSubsetFile(only_write,resolution,ss_locs);
    });
}

function writeSubsetFile(only_write,resolution,ss_locs){

    var subsetFile = fullPath('','subset_defs.txt');
    consoleMsg('writing subset file ' + subsetFile);
    var content = '';
    content += '# Auto generated subset file from DICe GUI\n';
    if(($("#analysisModeSelect").val()=="subset"||$("#analysisModeSelect").val()=="global")&&ROIDefsX[0].length>=3){
        if(ROIDefsX[0].length != ROIDefsY[0].length){
            alert('Error: subset file creation failed, invalid vertices for region of interest');
            return false;
        }
        content += 'begin region_of_interest\n';
        content += '  begin boundary\n';
        // write all the boundary shapes
        for(var i = 0, l = ROIDefsX.length; i < l; i++) {
            var ROIx = ROIDefsX[i];
            var ROIy = ROIDefsY[i];
            content += '    begin polygon\n';
            content += '      begin vertices\n';
            for(var j = 0, jl = ROIx.length; j < jl; j++) {
                content += '        ' +  ROIx[j] + ' ' + ROIy[j] + '\n';
            }
            content += '      end vertices\n';
            content += '    end polygon\n';
        }
        content += '  end boundary\n';
        if(excludedDefsX.length>0){
            if(excludedDefsX[0].length > 2){
                content += '  begin excluded\n';
                for(var i = 0, l = excludedDefsX.length; i < l; i++) {
                    var ROIx = excludedDefsX[i];
                    var ROIy = excludedDefsY[i];
                    content += '    begin polygon\n';
                    content += '      begin vertices\n';
                    for(var j = 0, jl = ROIx.length; j < jl; j++) {
                        content += '        ' + ROIx[j] + ' ' + ROIy[j] + '\n';
                    }
                    content += '      end vertices\n';
                    content += '    end polygon\n';
                }
                content += '  end excluded\n';
            } // excluded[0].length > 2
        } // excluded defs > 0
        content += 'end region_of_interest\n';
    }else if($("#analysisModeSelect").val()=="tracking"&&ROIDefsX[0].length>=3){ // tracking mode
        if(ROIDefsX[0].length != ROIDefsY[0].length){
            alert('Error: subset file creation failed, invalid vertices for region of interest');
            return false;
        }
        content += 'begin subset_coordinates\n';
        // use the centroid of each shape as the frame of reference origin
        for(var i = 0, l = ROIDefsX.length; i < l; i++) {
            var centroid = centroidOfPolygon(ROIDefsX[i],ROIDefsY[i]);
            content += centroid.x + ' ' + centroid.y + '\n';
        }
        content += 'end subset_coordinates\n';

        // add a polygon for each ROI
        for(var i = 0, l = ROIDefsX.length; i < l; i++) {
            content += 'begin conformal_subset\n';
            content += '  subset_id ' + i + '\n';
            content += '  begin boundary\n';
            content += '    begin polygon\n'; 
            content += '      begin vertices\n';
            var ROIx = ROIDefsX[i];
            var ROIy = ROIDefsY[i];
            for(var j = 0, jl = ROIx.length; j < jl; j++) {
                content += '        ' +  ROIx[j] + ' ' + ROIy[j] + '\n';
            }
            content += '      end vertices\n';           
            content += '    end polygon\n';
            content += '  end boundary\n';
            // excluded
            var has_excluded = false;
            for(var j = 0, jl = excludedAssignments.length; j < jl; j++) {
                if(excludedAssignments[j]==i)
                    has_excluded = true;
            }
            if(has_excluded){
                content += '  begin excluded\n';
            }
            for(var j = 0, jl = excludedAssignments.length; j < jl; j++) {
                if(excludedAssignments[j]==i){
                    content += '    begin polygon\n'; 
                    content += '      begin vertices\n';
                    var ROIx = excludedDefsX[j];
                    var ROIy = excludedDefsY[j];
                    for(var k = 0, kl = ROIx.length; k < kl; k++) {
                        content += '        ' +  ROIx[k] + ' ' + ROIy[k] + '\n';
                    }
                    content += '      end vertices\n';           
                    content += '    end polygon\n';
                }
            }
            if(has_excluded){
                content += '  end excluded\n';
            }
            // obstructed
            if(obstructedDefsX.length > 0){
                if(obstructedDefsX[0].length >= 3){
                    content += '  begin obstructed\n';
                    for(var j = 0, jl = obstructedDefsX.length; j < jl; j++) {
                        content += '    begin polygon\n'; 
                        content += '      begin vertices\n';
                        var ROIx = obstructedDefsX[j];
                        var ROIy = obstructedDefsY[j];
                        for(var k = 0, kl = ROIx.length; k < kl; k++) {
                            content += '        ' +  ROIx[k] + ' ' + ROIy[k] + '\n';
                        }
                        content += '      end vertices\n';           
                        content += '    end polygon\n';
                    }
                    content += '  end obstructed\n';
                }
                content += 'end conformal_subset\n';
            }
        }
        // for each ROI add the excluded regions with the excludedAssignment = to the ROI id
        // add all obstructions to all ROIs
    }
    if(ROIDefsX[0].length>=3){    
        fs.writeFile(subsetFile, content, function (err) {
            if(err){
                alert("Error: an error ocurred creating the file "+ err.message)
             }
            consoleMsg('subset_defs.txt file has been successfully saved');
            if(!only_write)
                callDICeExec(resolution,ss_locs);
        });
    }else{
        if(!only_write)
            callDICeExec(resolution,ss_locs);
    }
}

function checkValidInput() {
    consoleMsg('checking if input requirements met to enable running DICe ...');
    var validInput = true;
    var enableCross = true;
    //var enableResolution = true;
    var isSequence = $("#fileSelectMode").val()=='sequence';
    var isCine =  $("#fileSelectMode").val()=='cine';

    if(isCine){
        if(cinePathLeft=="undefined"){
            validInput = false;
            //enableResolution = false;
            enableCross = false;
        }
        if(showStereoPane==1||showStereoPane==2){
            if(cinePathRight=="undefined"){
                validInput = false;
                enableCross = false;
            }
            if(calPath=='undefined'){
                validInput = false;
            }
        }
        if(showStereoPane==0&&$("#calibrationCheck")[0].checked){
            if(calPath=='undefined'){
                validInput = false;
            }
        }
    }
    else{
    // see if the left reference image is set:
    if(refImagePathLeft=='undefined'||(refImagePathLeft=='sequence' && !isSequence)) {
        consoleMsg('left reference image not set yet');
        validInput = false;
        enableCross = false;
        //enableResolution = false;
    }
    // check that the image extensions all match
    var refExtension = refImagePathLeft.split('.').pop().toLowerCase();
    if(!defImagePathsLeft[0]){
        consoleMsg('deformed images have not been defined yet');
        validInput = false;
    }
    // check all the deformed images
    if(!isSequence){
      for(var i = 0, l = defImagePathsLeft.length; i < l; i++) {
        var defExtension = defImagePathsLeft[i].name.split('.').pop().toLowerCase();
        if(refExtension!=defExtension){
            //consoleMsg('deformed image ' + defImagePathsLeft[i].name + ' extension does not match ref extension');
            validInput = false;
        }
      }
    }

    if(showStereoPane==1||showStereoPane==2||(showStereoPane==0&&$("#calibrationCheck")[0].checked)){
      if(!calPath){
          validInput = false;
      }
      if(!isSequence){
        for(var i = 0, l = defImagePathsRight.length; i < l; i++) {
          var defExtension = defImagePathsRight[i].name.split('.').pop().toLowerCase();
          if(refExtension!=defExtension){
              //consoleMsg('deformed image ' + defImagePathsRight[i].name + ' extension does not match ref extension');
              validInput = false;
          }
        }
      }
    }
    
    // TODO check right images ...
    // see if the right reference image is set:
    if(refImagePathRight=='undefined'||(refImagePathRight=='sequence' && !isSequence)) {
        consoleMsg('right reference image not set yet');
        enableCross = false;
        if(showStereoPane==1||showStereoPane==2)
            validInput = false;
    }
    if(!isSequence&&defImagePathsRight.length<1)
        if(showStereoPane==1||showStereoPane==2)
          validInput = false;
    } // end else (not cine)
    // TODO see if the left and right ref have the same dimensions
    // TODO check the number of def images left and right
    
    if(validInput){
        $("#runLi").show();
        $("#writeLi").show();
        consoleMsg("input requirements successful");
    }else{
        $("#runLi").hide();
        $("#writeLi").hide();
    }
    if(enableCross){
        $("#previewCross").show();
        $("#initCross").show();
    }else{
        $("#previewCross").hide();
        $("#initCross").hide();
    }
    //if(enableResolution){
    //    $("#resolutionLi").show();
    //}else{
    //    $("#resolutionLi").hide();
    //}
}
