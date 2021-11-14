package ch.unibe.scg.comment.analysis.connectorapi;

import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
public class ApiController {

    /**
     * Simple Hello World method
     */
    @GetMapping("/hello")
    public String getHello(@RequestParam(value = "name", defaultValue = "World") String name){
        return String.format("Hello %s, my darling!", name);
    }

    /**
     * Main API Request Method
     */
    @PostMapping("/analysis")
    public AnalysisResult getAnalysis(@RequestParam String filepath, @RequestBody String src){
        return CliWrapper.analyzeCode(src, filepath);
        //return MockAnalysis.getMockAnalysis(src, filepath);
    }

}
