namespace Nexus_webapi.Utils;

public class GetConstants
{
    const string constantsPath = "globalConstants.json";
    public List<string> getConstants()
    {
        string json = File.ReadAllText(constantsPath);
        var jObject = JObject.Parse(json);
        List<string> constants = new List<string>();
        foreach (var item in jObject)
        {
            constants.Add(item.Key);
        }
        return constants;
    }
}