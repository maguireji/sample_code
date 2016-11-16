<?php
/*
Plugin Name: Speakers
Plugin URI: http://www.strategyinstitute.com
Description: Strategy Institute: Configure speakers.
Version: 1.0
Author: James Maguire
Author URI: http://www.strategyinstitute.com
License: GPLv2
*/

add_action( 'init', 'create_speakers' );

function create_speakers() {
    register_post_type( 'speakers',
        array(
            'labels' => array(
                'name' => 'Speakers',
                'singular_name' => 'Speaker',
                'add_new' => 'Add New',
                'add_new_item' => 'Add New Speaker',
                'edit' => 'Edit',
                'edit_item' => 'Edit Speaker',
                'new_item' => 'New Speaker',
                'view' => 'View',
                'view_item' => 'View Speaker',
                'search_items' => 'Search Speakers',
                'not_found' => 'No Speakers found',
                'not_found_in_trash' => 'No Speakers found in Trash',
                'parent' => 'Parent Speaker'
            ),
 
            'public' => true,
            'menu_position' => 15,
            'supports' => array( 'title', 'editor', 'comments', 'thumbnail'),
            'taxonomies' => array( '' ),
            'menu_icon' => plugins_url( 'users.png', __FILE__ ),
            'has_archive' => true
        )
    );
}

add_action( 'admin_init', 'my_admin' );

function my_admin() {
    add_meta_box( 'speakers_meta_box',
        'Speaker Details',
        'display_speaker_meta_box',
        'speakers', 'normal', 'high'
    );
}

function display_speaker_meta_box( $speaker ) {

    // Get Session titles and assign to drop down.

    global $wpdb;
    $table_name = $wpdb->prefix . "wp_posts";

    $session = $wpdb->get_results("SELECT distinct id, post_title, post_content, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_title') as session_title, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_subtitle') as session_subtitle, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_tagline') as session_tagline, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_type') as session_type, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_timefrom') as session_timefrom, (select meta_value from wp_postmeta where post_id = wp.ID and meta_key = 'session_timeto') as session_timeto FROM wp_posts wp inner join wp_postmeta pm on pm.post_id = wp.id WHERE post_type = 'session' and post_title not like '%Auto%' and post_status <> 'trash' order by session_timefrom asc");
    
    $speaker_firstname     = esc_html( get_post_meta( $speaker->ID, 'speaker_firstname', true ) );
    $speaker_lastname      = esc_html( get_post_meta( $speaker->ID, 'speaker_lastname', true ) );
    $speaker_jobtitle      = esc_html( get_post_meta( $speaker->ID, 'speaker_jobtitle', true ) );
    $speaker_companyname   = esc_html( get_post_meta( $speaker->ID, 'speaker_companyname', true ) );
    $speaker_session_ID    = esc_html( get_post_meta( $speaker->ID, 'speaker_session_ID', true ) );
    $speaker_moderator_bln = esc_html( get_post_meta( $speaker->ID, 'speaker_moderator_bln', true ) );

    if ($speaker_moderator_bln == "1") {
       $speaker_moderator_bln_selected = " checked ";
    }

    $txtSession = "<select id='speaker_session_ID' name='speaker_session_ID'>";
    $txtSession = $txtSession . "<option value='-1'>None</option>";
    foreach ($session as $row){
       if ($speaker_session_ID == $row->id) {
          $strSelected = "selected='selected'";
       } else {
          $strSelected = "";
       }
       $txtSession = $txtSession . "<option " . $strSelected . " value=".$row->id.">".$row-> session_timefrom." ".$row->post_title."</option>";
    }
    $txtSession = $txtSession . "</session>";


    ?>



    <table>

        <tr>
            <td style="width: 100%">Job Title</td>
            <td><input type="text" size="80" name="speaker_jobtitle" value="<?php echo $speaker_jobtitle; ?>" /></td>
        </tr>
        <tr>
            <td style="width: 100%">Company Name</td>
            <td><input type="text" size="80" name="speaker_companyname" value="<?php echo $speaker_companyname; ?>" /></td>
        </tr>
	<tr>
            <td style="width: 100%">Is a Moderator</td>
            <td><input type="checkbox" size="80" name="speaker_moderator_bln" <?=$speaker_moderator_bln_selected?>  value="1" /></td>
        </tr>	
         <tr>
            <td style="width: 100%">Session</td>
            <td><?=$txtSession?></td>
        </tr>
        <tr>
            
        </tr>
    </table>
    <?php
}

add_action( 'save_post', 'add_speaker_fields', 10, 2 );

function add_speaker_fields( $speaker_id, $speaker ) {
    // Check post type for movie reviews
    if ( $speaker->post_type == 'speakers' ) {
        // Store data in post meta table if present in post data
       
        if ( isset( $_POST['speaker_jobtitle'] ) && $_POST['speaker_jobtitle'] != '' ) {
            update_post_meta( $speaker_id, 'speaker_jobtitle', $_POST['speaker_jobtitle'] );
        }

        if ( isset( $_POST['speaker_companyname'] ) && $_POST['speaker_companyname'] != '' ) {
            update_post_meta( $speaker_id, 'speaker_companyname', $_POST['speaker_companyname'] );
        }
       
        if ( isset( $_POST['speaker_session_ID'] ) && $_POST['speaker_session_ID'] != '' ) {
            update_post_meta( $speaker_id, 'speaker_session_ID', $_POST['speaker_session_ID'] );
        }
       
        //if ( isset( $_POST['speaker_moderator_bln'] ) && $_POST['speaker_moderator_bln'] != '' ) {
            update_post_meta( $speaker_id, 'speaker_moderator_bln', $_POST['speaker_moderator_bln'] );
        //}
    }
}
?>
