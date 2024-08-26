import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { displayLobby, handleUserInput } from "./server.js";

class Player {
    constructor(stage) {
        this.hp = 100;
        this.stage = stage;
    }

    attack(monster) {
        const basedamage = Math.floor(Math.random() * 10) + 7; // 플레이어의 공격
        const plusdamage = this.stage
        const totaldamage = basedamage + plusdamage;
        monster.hp -= totaldamage;
        return totaldamage;
    }
}

class Monster {
    constructor(stage) { // 스테이지를 인자로 받기
        this.hp = 100 + stage * 10; // 스테이지 별로 체력 10 증가
        this.stage = stage;
    }

    attack(player) {
        const damage = Math.floor(Math.random() * 10) + 2 + this.stage; // 몬스터의 공격
        player.hp -= damage;
        return damage;
    }
}

function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(
        chalk.cyanBright(`| Stage: ${stage} `) +
        chalk.blueBright(
            `| 플레이어 정보 : ${player.hp} `,
        ) +
        chalk.redBright(
            `| 몬스터 정보 : ${monster.hp} | `,
        ),
    );
    console.log(chalk.magentaBright(`=====================\n`));
}

function playerDead(player) {
    let logs = [];
    logs.forEach((log) => console.log(log));
    if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
        console.clear();
        console.log(chalk.magentaBright(`=====================\n`));
        logs.push(chalk.red(`당신은 눈앞이 캄캄해졌습니다..`));
        logs.push(chalk.red(`재도전하시겠습니까?`));
        console.clear();
        logs.forEach((log) => console.log(log));
        console.log(chalk.green(`\n1. 재도전 2. 로비로 3. 종료`));
        const choice = readlineSync.question('당신의 선택은? ');

        if (choice === '1') {
            console.clear();
            startGame(); // 게임을 다시 시작
        } else if (choice === '2') {
            console.clear();
            displayLobby(); // 로비 화면으로 돌아가기
            handleUserInput(); // 로비에서 입력을 처리
        }
        else {
            console.log(chalk.red('다음에 또 만나요.'));
            process.exit(0); // 게임 종료
        }
    }
}
const battle = async (stage, player, monster) => {
    let logs = [];
    let escape = false;
    while (player.hp > 0 && monster.hp > 0) {
        console.clear();
        displayStatus(stage, player, monster);
        console.log(chalk.yellowBright(`\n${stage} 스테이지 입니다.\n`));
        logs.forEach((log) => console.log(log));

        console.log(
            chalk.green(
                `\n1. 공격한다 2. 연속 공격(35%) 3. 방어하기(65%) 4. 도망친다(20%)`,
            ),
        );

        process.stdout.write('당신의 선택은? : ');
        const choice = readlineSync.question(); // 사용자가 입력한 값을 받음
        // 플레이어의 선택에 따라 다음 행동 처리
        logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
        switch (choice) {
            case "1": {
                const Critical = 0.3; // 재미를 위한 크리티컬 요소
                let damage = player.attack(monster);
                if (Math.random() < Critical) {
                    const CriticalDamage = damage * 1.7;
                    logs.push(chalk.blue(`[크리티컬]플레이어의 공격! ${CriticalDamage.toFixed(0)}만큼 피해를 입혔습니다.`));
                    monster.hp -= (CriticalDamage - damage).toFixed(0);
                    if (monster.hp > 0) {
                        const damage = monster.attack(player);
                        logs.push(chalk.red(`몬스터의 공격! ${damage}만큼 피해를 입혔습니다.\n`));

                        if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                            playerDead(player);
                            return;
                        }
                    } else {
                        logs.push(chalk.red(`몬스터를 처치했습니다.`));
                    }
                }
                else {
                    logs.push(chalk.blue(`플레이어의 공격! ${damage}만큼 피해를 입혔습니다.`));
                    if (monster.hp > 0) {
                        const damage = monster.attack(player);
                        logs.push(chalk.red(`몬스터의 공격! ${damage}만큼 피해를 입혔습니다.\n`));

                        if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                            playerDead(player);
                            return;
                        }
                    } else {
                        logs.push(chalk.red(`몬스터를 처치했습니다.`));
                    }
                }
                break;
            }
            case "2": {
                const Probability = 0.35;
                if (Math.random() < Probability) { // 연속 공격 성공
                    const attackCount = Math.floor(Math.random() * 3) + 2; // 2~4회 공격
                    logs.push(chalk.blue(`연속 공격이 성공했습니다! ${attackCount}회 공격을 수행합니다.`));
                    for (let i = 0; i < attackCount; i++) {
                        const damage = player.attack(monster);
                        logs.push(chalk.blue(`연속 공격 ${i + 1}! ${damage}만큼 피해를 입혔습니다.`));
                        if (monster.hp <= 0) {
                            logs.push(chalk.red(`몬스터를 처치했습니다.`));
                            break;
                        }
                    }
                    if (monster.hp > 0) {
                        const damage = monster.attack(player);
                        logs.push(chalk.red(`몬스터의 반격! ${damage}만큼 피해를 입혔습니다.\n`));
                        if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                            playerDead(player);
                            return;
                        }
                    }

                } else { // 연속 공격 실패
                    logs.push(chalk.red(`연속 공격에 실패했습니다.`));
                    if (monster.hp > 0) {
                        const damage = monster.attack(player);
                        logs.push(chalk.red(`몬스터의 공격! ${damage}만큼 피해를 입혔습니다.\n`));
                        if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                            playerDead(player);
                            return;
                        }
                    }
                }
                break;
            }
            case "3": {
                const Probability = 0.65;
                if (Math.random() < Probability) { // 방어 성공
                    logs.push(chalk.blue(`방어 성공! 몬스터의 공격을 완전히 막아냅니다.`));
                } else { // 방어 실패
                    logs.push(chalk.red(`방어 실패.. 몬스터의 공격이 그대로 들어옵니다.`));
                    const damage = monster.attack(player);
                    logs.push(chalk.red(`몬스터의 공격! ${damage}만큼 피해를 입혔습니다.\n`));
                    if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                        playerDead(player);
                        return;
                    }
                }
                break;
            }
            case "4": {
                const Probability = 0.2;
                if (Math.random() < Probability) { //도주 성공
                    logs.push(chalk.green(`당신은 재빠르게 도망쳤습니다!`));
                    escape = true;
                    break;
                } else {//도주 실패
                    logs.push(chalk.red(`도주 실패.. 몬스터가 당신을 공격합니다.`));
                    const damage = monster.attack(player);
                    logs.push(chalk.red(`몬스터의 공격! ${damage}만큼 피해를 입혔습니다.\n`));
                    if (player.hp <= 0) {  // 플레이어 체력이 0 이하인지 확인
                        playerDead(player);
                        return;
                    }
                }

            }
        }
        if (escape === true) {
            break;
        }
    }

};

export async function startGame() {
    console.clear();
    let stage = 1;

    const player = new Player(stage);
    while (stage <= 10) {
        const monster = new Monster(stage);
        await battle(stage, player, monster);
        player.hp = 100 + stage * 10;
        // 스테이지 클리어 및 게임 종료 조건
        stage++;
    }
    console.clear();
    console.log(chalk.cyanBright('축하합니다! 모든 스테이지를 클리어했습니다.'));
    console.log(
        chalk.green(
            `\n1. 종료한다 2. 로비로 돌아간다`,
        ),
    );
    process.stdout.write('당신의 선택은? : ');
    const choice = readlineSync.question(); // 사용자가 입력한 값을 받음
    if (choice === '1') {
        console.log(chalk.red('다음에 또 만나요.'));
        process.exit(0); // 게임 종료
    }
    else if(choice ==='2'){
        displayLobby();
        handleUserInput();
    }
}