var app = new Vue({
  el: ".container",
  data: {
    actions: [],
    points: [],
    tiled: [],
    teams: [],
    time: 0,
    turnLimit: 0,
    loading: true,
    ally: 1,
    enemy: 2,
    token: "team1",
    url: "localhost:8081",
    agents: [],
    score: {
      allyArea: 0,
      allyTile: 0,
      enemyArea: 0,
      enemyTile: 0
    },
    request: [],
    moveAgent: {},
    pointTiles: [],
    interval: ""
  },
  created() {
    console.log("create");
  },
  methods: {
    setMove(x, y) {
      let dx,
        dy,
        remove = 0;
      dx = x + 1 - this.moveAgent.x;
      dy = y + 1 - this.moveAgent.y;
      //   let enemyAgent = this.teams.filter(team => team.teamID !== this.ally)[0]
      //     .agents;
      console.log(this.pointTiles);

      this.pointTiles.forEach((tile, index) => {
        if (
          tile.x === x + 1 &&
          tile.y === y + 1 &&
          tile.teamID === this.enemy
        ) {
          remove = 1;
        }
      });

      this.request.forEach(action => {
        if (action.agentID === this.moveAgent.agentID) {
          action.dx = dx;
          action.dy = dy;
          if (remove) {
            action.type = "remove";
          }
          console.log(action);
        }
      });
      this.moveAgent = {};
    },
    setTile(x, y) {
      if (this.moveAgent.x !== undefined) {
        this.setMove(x, y);
      } else {
        this.agents.forEach(agent => {
          if (agent.x === x + 1 && agent.y === y + 1) {
            this.moveAgent = agent;

            console.log(this.moveAgent.agentID);
          }
        });
      }
    },
    setStyle(x, y) {
      let allAgents = this.teams[0].agents.concat(this.teams[1].agents);
      let active = "";
      tiled = "";
      allAgents.forEach(agent => {
        if (agent.x === x + 1 && agent.y === y + 1) active += " active";
      });
      if (x === this.moveAgent.x && y === this.moveAgent.y) tiled = " tiled";
      if (this.tiled[y][x] === this.ally / 1) {
        return "ally" + active + tiled;
      } else if (this.tiled[y][x] === this.enemy / 1) {
        return "enemy" + active;
      } else {
        return "";
      }
    },
    timer() {
      this.interval = setInterval(
        function() {
          this.time -= 0.5;
          if (this.time === -1) {
            console.log("came to 0");
            this.clear();
            this.init();
            this.pointTiles = [];
            this.request = [];
          }
          if (this.time === 1) {
            // this.submit();
          }
        }.bind(this),
        500
      );
    },
    clear() {
      clearInterval(this.interval);
    },
    init(start) {
      if (!this.loading) {
        axios
          .get(`/test/${this.url}`)
          .then(res => {
            let { actions, points, tiled, teams, time, turnLimit } = res.data;
            this.actions = actions;
            this.points = points;
            this.tiled = tiled;
            this.teams = teams;
            console.log("teams", teams);
            this.time = time / 1;
            console.log("newtime", this.time, time / 1);
            this.timer();
            this.turnLimit = turnLimit;
            this.loading = false;

            this.agents = [];
            this.teams.forEach(team => {
              if (team.teamID === this.ally / 1) {
                console.log("ourteam", team);
                this.agents = team.agents;
                this.score.allyArea = team.areaPoint;
                this.score.allyTile = team.tilePoint;
              } else {
                this.score.enemyArea = team.areaPoint;
                this.score.enemyTile = team.tilePoint;
              }
            });
            this.agents.forEach(agent => {
              this.request.push({
                agentID: agent.agentID,
                type: "move",
                dx: 0,
                dy: 0
              });
            });
            console.log("request", this.request);

            tiled.forEach((row, y) => {
              row.forEach((point, x) => {
                if (tiled[y][x] == this.ally) {
                  this.pointTiles.push({
                    x: x + 1,
                    y: y + 1,
                    teamID: this.ally
                  });
                } else if (tiled[y][x] == this.enemy) {
                  this.pointTiles.push({
                    x: x + 1,
                    y: y + 1,
                    teamID: this.enemy
                  });
                }
              });
            });
            console.log("pointtiles", this.pointTiles);
          })
          .catch(err => {
            if (err) console.log(err);
          });
      } else {
        this.loading = false;
        if (start) this.init();
      }
    },
    submit() {
      console.log(this.request);
      axios
        .post(`/move/${this.token}/${this.url}`, { actions: this.request })
        .then(res => console.log(res))
        .catch(err => {
          if (err) console.log(err);
        });
    }
  }
});
