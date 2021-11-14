package ch.unibe.scg.comment.analysis.connectorapi;

import ch.unibe.scg.comment.analysis.neon.cli.NormalizedString;
import ch.unibe.scg.comment.analysis.neon.cli.task.T12Classify;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class CliWrapper {

    private static T12Classify javaClassifier;
    private static T12Classify pythonClassifier;
    private static T12Classify smalltalkClassifier;
    private static boolean initialized = false;

    private CliWrapper(){}

    public static void initializeClassifier(){
        if(!initialized) {
            try {
                javaClassifier = new T12Classify("java");
                pythonClassifier = new T12Classify("python");
                smalltalkClassifier = new T12Classify("pharo");
                initialized = true;
                Logger.getLogger("CliWrapper").info("Initialzed Classifiers");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    public static AnalysisResult analyzeCode(String src, String filepath) {
        if(!initialized){
            initializeClassifier();
        }

        String extension = "";

        int i = filepath.lastIndexOf('.');
        if (i > 0) {
            extension = filepath.substring(i+1);
        }
        try{
            switch (extension){
                case "java":
                    return mapToAnalysisResultWrapper(javaClassifier.classify(src));
                case "py":
                    return mapToAnalysisResultWrapper(pythonClassifier.classify(src));
                case "sm":
                    return mapToAnalysisResultWrapper(smalltalkClassifier.classify(src));
            }
        }catch (Exception e){
            return new AnalysisResult(2, "An Error occured when classifiying the comments!", new ArrayList<>());
        }

        return new AnalysisResult(1, "Not supported language!", new ArrayList<>());

    }

    private static AnalysisResult mapToAnalysisResultWrapper(Map<NormalizedString.Range, List<String>> result){
        ArrayList<AnalysisRange> ranges = new ArrayList<>();
        result.forEach( (r, l) -> {
            if(!l.isEmpty()) {
                ranges.add(new AnalysisRange(r.start, r.end, l.toArray(new String[0])));
            }
        });
        return new AnalysisResult(0, "", ranges);
    }



}
