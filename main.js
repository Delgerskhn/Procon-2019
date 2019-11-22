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
    ally: 5,
    enemy: 6,
    token: "team1",
    url: "localhost:8081",
    agents: [],
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

      this.pointTiles.forEach((tile, index) => {
        if (tile.x === x + 1 && tile.y === y + 1) {
          remove = 1;
        }
      });

      this.request.forEach(action => {
        if (action.agentID === this.moveAgent.agentID) {
          action.dx = dx;
          action.dy = dy;
          if (remove) action.type = "remove";
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
            console.log(agent);
          }
        });
      }
    },
    setStyle(x, y) {
      let allAgents = this.teams[0].agents.concat(this.teams[1].agents);
      let active = "";
      allAgents.forEach(agent => {
        if (agent.x === x + 1 && agent.y === y + 1) active += " active";
      });

      if (this.tiled[y][x] === this.ally / 1) {
        return "ally" + active;
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
          if (this.time === 0) {
            console.log("came to 0");
            this.clear();
            this.init();
            this.pointTiles = [];
            this.request = [];
          }
          if (this.time === 1.5) {
            this.submit();
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
        console.log(this.ally, this.enemy, this.token);
        axios
          .get("/test")
          .then(res => {
            let { actions, points, tiled, teams, time, turnLimit } = res.data;
            this.actions = actions;
            this.points = points;
            this.tiled = tiled;
            this.teams = teams;
            this.time = time / 1 + 1;
            console.log("newtime", this.time, time / 1);
            this.timer();
            this.turnLimit = turnLimit;
            this.loading = false;
            this.agents = teams.filter(
              team => team.teamID === this.ally
            )[0].agents;
            this.agents.forEach(agent => {
              this.request.push({
                agentID: agent.agentID,
                type: "move",
                dx: 0,
                dy: 0
              });
            });

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

            console.log("res.data", res.data, "pointTiles", this.pointTiles);
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
