# Trigger benchmark: runs each query with `claude -p` in a project that has the skill installed
# and records which skill the agent loads. Usage: python3 run_trigger_bench.py <project-dir> trigger-eval.json out.json
import json,subprocess,sys,os
from concurrent.futures import ThreadPoolExecutor
proj,evalf,out=sys.argv[1],sys.argv[2],sys.argv[3]
qs=json.load(open(evalf))
env={k:v for k,v in os.environ.items() if k!="CLAUDECODE"}
def run(q):
    try:
        p=subprocess.run(["claude","-p",q["query"],"--output-format","stream-json","--verbose","--max-turns","3","--disallowedTools","Write,Edit,Bash(rm:*)"],cwd=proj,env=env,capture_output=True,text=True,timeout=150)
        lines=p.stdout.splitlines()
    except subprocess.TimeoutExpired as e:
        lines=(e.stdout or b"").decode(errors="replace").splitlines() if isinstance(e.stdout,bytes) else (e.stdout or "").splitlines()
    used=[]
    for l in lines:
        try: e=json.loads(l)
        except: continue
        if e.get("type")=="assistant":
            for c in e["message"]["content"]:
                if c.get("type")=="tool_use":
                    if c["name"]=="Skill": used.append(c["input"].get("skill",""))
                    elif c["name"]=="Read" and "SKILL.md" in json.dumps(c["input"]): used.append("read:"+c["input"].get("file_path","").split("/")[-2])
    return {**q,"skills_used":used}
with ThreadPoolExecutor(6) as ex: res=list(ex.map(run,qs))
json.dump(res,open(out,"w"),indent=1)
