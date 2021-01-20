/*  @js 所有chemdoodle窗口初始化
***************************************************************************************************************/
var TDMap = getMap();
var canMap = getMap();
function getMap() {
    var map_ = new Object();    
    map_.put = function(key, value) {    
        map_[key+'_'] = value;    
    };    
    map_.get = function(key) {    
        return map_[key+'_'];    
    };    
    map_.remove = function(key) {    
        delete map_[key+'_'];  
    };     
    return map_;
}
function structureInitial(){
    canMap.put(0,sketcher0);
    canMap.put(1,sketcher1);
    canMap.put(2,sketcher2);
    canMap.put(3,sketcher3);
    canMap.put(4,sketcher4);
    canMap.put(5,sketcher5);
    canMap.put(6,sketcher6);
    canMap.put(7,sketcher7);
    canMap.put(8,sketcher8);
    canMap.put(9,sketcher9);
    canMap.put(10,sketcher10);
    canMap.put(11,sketcher11);
    canMap.put(12,sketcher12);
    canMap.put(13,sketcher13);
    canMap.put(14,sketcher14);
    sketcher0.clear();
    sketcher1.clear();
    sketcher2.clear();
    sketcher3.clear();
    sketcher4.clear();
    sketcher5.clear();
    sketcher6.clear();
    sketcher7.clear();
    sketcher8.clear();
    sketcher9.clear();
    sketcher10.clear();
    sketcher11.clear();
    sketcher12.clear();
    sketcher13.clear();
    sketcher14.clear();
}
function scaffoldInitial(){
    canMap.put(15,sketcher15);
    canMap.put(16,sketcher16);
    canMap.put(17,sketcher17);
    canMap.put(18,sketcher18);
    canMap.put(19,sketcher19);
    canMap.put(20,sketcher20);
    canMap.put(21,sketcher21);
    canMap.put(22,sketcher22);
    canMap.put(23,sketcher23);
    canMap.put(24,sketcher24);
    canMap.put(25,sketcher25);
    canMap.put(26,sketcher26);
    canMap.put(27,sketcher27);
    canMap.put(28,sketcher28);
    canMap.put(29,sketcher29);
    sketcher15.clear();
    sketcher16.clear();
    sketcher17.clear();
    sketcher18.clear();
    sketcher19.clear();
    sketcher20.clear();
    sketcher21.clear();
    sketcher22.clear();
    sketcher23.clear();
    sketcher24.clear();
    sketcher25.clear();
    sketcher26.clear();
    sketcher27.clear();
    sketcher28.clear();
    sketcher29.clear();
}
function scafDetailInitial(){
    canMap.put(31,sketcher31);
    canMap.put(32,sketcher32);
    canMap.put(33,sketcher33);
    canMap.put(34,sketcher34);
    sketcher31.clear();
    sketcher32.clear();
    sketcher33.clear();
    sketcher34.clear();
}
function refMolInitial(){
    canMap.put(35,sketcher35);
    canMap.put(36,sketcher36);
    canMap.put(37,sketcher37);
    canMap.put(38,sketcher38);
    canMap.put(39,sketcher39);
    canMap.put(40,sketcher40);
    canMap.put(41,sketcher41);
    canMap.put(42,sketcher42);
    canMap.put(43,sketcher43);
    canMap.put(44,sketcher44);
    canMap.put(45,sketcher45);
    canMap.put(46,sketcher46);
    canMap.put(47,sketcher47);
    canMap.put(48,sketcher48);
    canMap.put(49,sketcher49);
    sketcher35.clear();
    sketcher36.clear();
    sketcher37.clear();
    sketcher38.clear();
    sketcher39.clear();
    sketcher40.clear();
    sketcher41.clear();
    sketcher42.clear();
    sketcher43.clear();
    sketcher44.clear();
    sketcher45.clear();
    sketcher46.clear();
    sketcher47.clear();
    sketcher48.clear();
    sketcher49.clear();
}
function drugInitial(){
    canMap.put(50,sketcher50);
    canMap.put(51,sketcher51);
    canMap.put(52,sketcher52);
    canMap.put(53,sketcher53);
    canMap.put(54,sketcher54);
    canMap.put(55,sketcher55);
    canMap.put(56,sketcher56);
    canMap.put(57,sketcher57);
    canMap.put(58,sketcher58);
    canMap.put(59,sketcher59);
    canMap.put(60,sketcher60);
    canMap.put(61,sketcher61);
    canMap.put(62,sketcher62);
    canMap.put(63,sketcher63);
    canMap.put(64,sketcher64);
    sketcher50.clear();
    sketcher51.clear();
    sketcher52.clear();
    sketcher53.clear();
    sketcher54.clear();
    sketcher55.clear();
    sketcher56.clear();
    sketcher57.clear();
    sketcher58.clear();
    sketcher59.clear();
    sketcher60.clear();
    sketcher61.clear();
    sketcher62.clear();
    sketcher63.clear();
    sketcher64.clear();
}

function alignmentInitial(){
    canMap.put(65,sketcher65);
    canMap.put(66,sketcher66);
    canMap.put(67,sketcher67);
    canMap.put(68,sketcher68);
    canMap.put(69,sketcher69);
    canMap.put(70,sketcher70);
    sketcher65.clear();
    sketcher66.clear();
    sketcher67.clear();
    sketcher68.clear();
    sketcher69.clear();
    sketcher70.clear();
}

function hoverMolInitial(){
    canMap.put(71,sketcher71);
    canMap.put(72,sketcher72);
    sketcher71.clear();
    sketcher72.clear();
    
}
function selectMolInitial(){
    canMap.put(73,sketcher73);
    canMap.put(74,sketcher74);
    sketcher73.clear();
    sketcher74.clear();
}

//  单个chemdoodle窗口初始化
function chemdoodleInitial(data){
    var molFile = data;
    var molecule = ChemDoodle.readMOL(molFile);
    ChemDoodle.informatics.removeH(molecule);
    stickTransformer.loadMolecule(molecule);
}

//  清空前一页的所有3dMol数据
function clear3DMol(){
    //  原生3DMol拥有一个clear函数，可以清空，但需由对象调用。
    //  故直接删除DOM元素
    $(".frame .image").children("canvas").remove();   
}

//set default style
function structureStyle(transformer){
    transformer.specs.atoms_useJMOLColors = true;
    // make bonds thicker
    transformer.specs.bonds_width_2D = 1;
    // don't draw atoms
    transformer.specs.atoms_display = true;
    // change the background color to black
    //transformer.specs.backgroundColor = '#fbfcfd';
    transformer.specs.backgroundColor = '#fff';
    // clear overlaps to show z-depth
    transformer.specs.bonds_clearOverlaps_2D = true;
} 